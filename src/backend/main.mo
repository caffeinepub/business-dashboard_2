import Text "mo:core/Text";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:base/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {

  // ─── Legacy stable state (kept for upgrade compatibility) ─────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type LegacyRole = { #admin; #user; #guest };
  type LegacyRegistration = { username : Text; password : Text; role : LegacyRole };
  let registrations = Map.empty<Text, LegacyRegistration>();
  var firstRun = true;

  // ─── User Types ─────────────────────────────────────────────────────────────

  public type UserRole = {
    #superAdmin;
    #admin;
    #dataOperator;
    #employee;
  };

  type UserRecord = {
    username : Text;
    password : Text;
    name     : Text;
    phone    : Text;
    role     : UserRole;
  };

  public type UserInfo = {
    username : Text;
    name     : Text;
    phone    : Text;
    role     : UserRole;
  };

  // ─── Employee Types ─────────────────────────────────────────────────────────

  public type EmployeeInfo = {
    id     : Nat;
    name   : Text;
    phone  : Text;
    role   : Text;
    salary : Nat;
  };

  // ─── CRM Types ───────────────────────────────────────────────────────────────

  public type InquiryStatus = {
    #new_;
    #followUp;
    #closed;
  };

  public type InquiryInfo = {
    id          : Nat;
    name        : Text;
    phone       : Text;
    requirement : Text;
    status      : InquiryStatus;
    createdAt   : Int;
  };

  // ─── State ──────────────────────────────────────────────────────────────────

  let users     = Map.empty<Text, UserRecord>();
  let employees = Map.empty<Nat, EmployeeInfo>();
  var nextEmpId : Nat = 1;

  let inquiries   = Map.empty<Nat, InquiryInfo>();
  var nextInqId   : Nat = 1;

  // ─── Helpers ────────────────────────────────────────────────────────────────

  func isAdminRole(role : UserRole) : Bool {
    role == #superAdmin or role == #admin;
  };

  func canManageEmployees(role : UserRole) : Bool {
    role == #superAdmin or role == #admin or role == #dataOperator;
  };

  func authUser(username : Text, password : Text) : ?UserRecord {
    switch (users.get(username)) {
      case (null) { null };
      case (?u) { if (u.password == password) { ?u } else { null } };
    };
  };

  func toInfo(u : UserRecord) : UserInfo {
    { username = u.username; name = u.name; phone = u.phone; role = u.role };
  };

  // ─── User API ────────────────────────────────────────────────────────────────

  public query func authenticate(username : Text, password : Text) : async ?UserInfo {
    switch (authUser(username, password)) {
      case (null) { null };
      case (?u)   { ?toInfo(u) };
    };
  };

  public query func listUsers(requesterUsername : Text, requesterPassword : Text) : async [UserInfo] {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?req) {
        if (not isAdminRole(req.role)) { Runtime.trap("Unauthorized") };
        users.values().toArray().map(toInfo);
      };
    };
  };

  public shared func createUser(
    requesterUsername : Text,
    requesterPassword : Text,
    username : Text,
    password : Text,
    name     : Text,
    phone    : Text,
    role     : UserRole,
  ) : async () {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?req) {
        if (not isAdminRole(req.role)) { Runtime.trap("Unauthorized") };
        switch (users.get(username)) {
          case (?_) { Runtime.trap("Username already exists") };
          case (null) {
            users.add(username, { username; password; name; phone; role });
          };
        };
      };
    };
  };

  public shared func updateUser(
    requesterUsername : Text,
    requesterPassword : Text,
    username : Text,
    name     : Text,
    phone    : Text,
    role     : UserRole,
  ) : async () {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?req) {
        if (not isAdminRole(req.role)) { Runtime.trap("Unauthorized") };
        switch (users.get(username)) {
          case (null) { Runtime.trap("User not found") };
          case (?u) {
            users.add(username, { username; password = u.password; name; phone; role });
          };
        };
      };
    };
  };

  public shared func deleteUser(
    requesterUsername : Text,
    requesterPassword : Text,
    username : Text,
  ) : async () {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?req) {
        if (not isAdminRole(req.role)) { Runtime.trap("Unauthorized") };
        if (username == requesterUsername) { Runtime.trap("Cannot delete yourself") };
        users.remove(username);
      };
    };
  };

  public shared func changePassword(
    username    : Text,
    oldPassword : Text,
    newPassword : Text,
  ) : async () {
    switch (authUser(username, oldPassword)) {
      case (null) { Runtime.trap("Current password is incorrect") };
      case (?u) {
        users.add(username, { u with password = newPassword });
      };
    };
  };

  public shared func resetPassword(
    requesterUsername : Text,
    requesterPassword : Text,
    targetUsername    : Text,
    newPassword       : Text,
  ) : async () {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?req) {
        if (not isAdminRole(req.role)) { Runtime.trap("Unauthorized") };
        switch (users.get(targetUsername)) {
          case (null) { Runtime.trap("User not found") };
          case (?u) {
            users.add(targetUsername, { u with password = newPassword });
          };
        };
      };
    };
  };

  public shared func initializeDefaults() : async () {
    let defaults : [(Text, Text, Text, Text, UserRole)] = [
      ("superadmin", "super123", "Super Admin",   "", #superAdmin),
      ("admin",      "admin123", "Administrator",  "", #admin),
      ("operator",   "op123",    "Data Operator",  "", #dataOperator),
      ("employee",   "emp123",   "Employee User",  "", #employee),
    ];
    for ((username, password, name, phone, role) in defaults.vals()) {
      switch (users.get(username)) {
        case (?u) { users.add(username, { u with password }) };
        case (null) {
          users.add(username, { username; password; name; phone; role });
        };
      };
    };
  };

  // ─── Employee API ────────────────────────────────────────────────────────────

  public query func listEmployees(
    requesterUsername : Text,
    requesterPassword : Text,
  ) : async [EmployeeInfo] {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?_)   { employees.values().toArray() };
    };
  };

  public shared func addEmployee(
    requesterUsername : Text,
    requesterPassword : Text,
    name   : Text,
    phone  : Text,
    role   : Text,
    salary : Nat,
  ) : async Nat {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?req) {
        if (not canManageEmployees(req.role)) { Runtime.trap("Unauthorized") };
        let id = nextEmpId;
        nextEmpId += 1;
        employees.add(id, { id; name; phone; role; salary });
        id;
      };
    };
  };

  public shared func updateEmployee(
    requesterUsername : Text,
    requesterPassword : Text,
    id     : Nat,
    name   : Text,
    phone  : Text,
    role   : Text,
    salary : Nat,
  ) : async () {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?req) {
        if (not canManageEmployees(req.role)) { Runtime.trap("Unauthorized") };
        switch (employees.get(id)) {
          case (null) { Runtime.trap("Employee not found") };
          case (?_)   { employees.add(id, { id; name; phone; role; salary }) };
        };
      };
    };
  };

  public shared func deleteEmployee(
    requesterUsername : Text,
    requesterPassword : Text,
    id : Nat,
  ) : async () {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?req) {
        if (not canManageEmployees(req.role)) { Runtime.trap("Unauthorized") };
        employees.remove(id);
      };
    };
  };

  // ─── CRM / Inquiry API ───────────────────────────────────────────────────────

  public query func listInquiries(
    requesterUsername : Text,
    requesterPassword : Text,
  ) : async [InquiryInfo] {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?_)   { inquiries.values().toArray() };
    };
  };

  public shared func addInquiry(
    requesterUsername : Text,
    requesterPassword : Text,
    name        : Text,
    phone       : Text,
    requirement : Text,
  ) : async Nat {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?_) {
        let id = nextInqId;
        nextInqId += 1;
        inquiries.add(id, {
          id;
          name;
          phone;
          requirement;
          status = #new_;
          createdAt = Time.now();
        });
        id;
      };
    };
  };

  public shared func updateInquiryStatus(
    requesterUsername : Text,
    requesterPassword : Text,
    id     : Nat,
    status : InquiryStatus,
  ) : async () {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?_) {
        switch (inquiries.get(id)) {
          case (null) { Runtime.trap("Inquiry not found") };
          case (?inq) { inquiries.add(id, { inq with status }) };
        };
      };
    };
  };

  public shared func deleteInquiry(
    requesterUsername : Text,
    requesterPassword : Text,
    id : Nat,
  ) : async () {
    switch (authUser(requesterUsername, requesterPassword)) {
      case (null) { Runtime.trap("Authentication failed") };
      case (?req) {
        if (not canManageEmployees(req.role)) { Runtime.trap("Unauthorized") };
        inquiries.remove(id);
      };
    };
  };
};
