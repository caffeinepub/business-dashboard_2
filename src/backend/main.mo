import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  public type Registration = {
    username : Text;
    password : Text;
    role : AccessControl.UserRole;
  };

  public type UserProfile = {
    principal : Principal;
    username : Text;
    role : AccessControl.UserRole;
  };

  // User profiles store mapping from usernames to profiles
  // For this example, re-registering an existing username will overwrite the existing profile
  let registrations = Map.empty<Text, Registration>();

  var firstRun = true;

  module Registration {
    public func compare(a : Registration, b : Registration) : Order.Order {
      Text.compare(a.username, b.username);
    };
  };

  public shared ({ caller }) func register(username : Text, password : Text, role : AccessControl.UserRole) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can register new users with a custom role");
    };

    let registration : Registration = {
      username;
      password;
      role;
    };
    registrations.add(username, registration);
  };

  // Validates a single Registration and returns a UserProfile if password matches
  func validateRegistration(registration : Registration, password : Text) : ?UserProfile {
    if (registration.password == password) {
      ?{
        principal = Principal.fromText(registration.username);
        username = registration.username;
        role = registration.role;
      };
    } else {
      null;
    };
  };

  // Authenticates a user by username and password
  // Returns a UserProfile if username exists and password matches, otherwise returns null
  // NOTE: This function intentionally has no authorization check as it's used for login
  // However, it should be rate-limited in production to prevent brute force attacks
  public query func authenticate(username : Text, password : Text) : async ?UserProfile {
    switch (registrations.get(username)) {
      case (null) { null };
      case (?registration) {
        validateRegistration(registration, password);
      };
    };
  };

  /* First motoko lineup: admin - admin admin, operator - operator - user, employee - employee-guest */
  public shared ({ caller }) func initializeActorAdmin() : async () {
    if (firstRun) {
      firstRun := false;
      let admin = {
        username = "admin";
        password = "admin";
        role = #admin;
      };
      let operator = {
        username = "operator";
        password = "operator";
        role = #user;
      };
      let employee = {
        username = "employee";
        password = "employee";
        role = #guest;
      };
      registrations.add("admin", admin);
      registrations.add("operator", operator);
      registrations.add("employee", employee);
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    // Only authenticated users (at least #user role) can get their profile
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };

    // Fetch the username from the principal
    let principal = caller.toText();
    let username = principal;

    // Check if user is registered
    switch (registrations.get(username)) {
      case (null) { Runtime.trap("User not registered") };
      case (?registration) {
        {
          principal = caller;
          username;
          role = registration.role;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    let principal = user.toText();
    let username = principal;
    switch (registrations.get(username)) {
      case (null) { Runtime.trap("User not registered") };
      case (?registration) {
        {
          principal = user;
          username;
          role = registration.role;
        };
      };
    };
  };

  public query ({ caller }) func getAllProfiles() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can list all users");
    };
    let registrationsArray = registrations.values().toArray();
    registrationsArray.map(func(registration) { validateRegistration(registration, registration.password) }).filter(func(x) { x != null }).map(func(x) { switch (x) { case (null) { Runtime.trap("Unreachable") }; case (?userProfile) { userProfile } } });
  };

  public query ({ caller }) func getAllRegistrationsSorted() : async [Registration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };
    registrations.values().toArray().sort();
  };

  public query ({ caller }) func listAllUserProfiles() : async [UserProfile] {
    let callerRole = AccessControl.getUserRole(accessControlState, caller);

    switch (callerRole) {
      case (#admin) {
        // Admins can see all users
        let registrationsArray = registrations.values().toArray();
        registrationsArray.map(func(registration) { validateRegistration(registration, registration.password) }).filter(func(x) { x != null }).map(func(x) { switch (x) { case (null) { Runtime.trap("Unreachable") }; case (?userProfile) { userProfile } } });
      };
      case (#user) {
        // Operators (users) can see limited info about all users (username and role only)
        // For this implementation, they see all profiles
        let registrationsArray = registrations.values().toArray();
        registrationsArray.map(func(registration) { validateRegistration(registration, registration.password) }).filter(func(x) { x != null }).map(func(x) { switch (x) { case (null) { Runtime.trap("Unreachable") }; case (?userProfile) { userProfile } } });
      };
      case (#guest) {
        // Employees (guests) can only see themselves
        let callerUsername = caller.toText();
        let registrationsArray = registrations.values().toArray();
        registrationsArray.map(
          func(registration) {
            if (registration.username == callerUsername) {
              validateRegistration(registration, registration.password);
            } else {
              null;
            };
          }
        ).filter(func(x) { x != null }).map(func(x) { switch (x) { case (null) { Runtime.trap("Unreachable") }; case (?userProfile) { userProfile } } });
      };
    };
  };

  // Verify user well-formedness predicate
  func verifyUserWellformednessPredicate(proxyUser : Principal, user : Registration) : () {
    if (proxyUser.toText() != user.username) {
      Runtime.trap("Username must match principal text representation");
    };
  };
};
