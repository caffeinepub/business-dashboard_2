export interface UserInfo {
  username: string;
  name: string;
  phone: string;
  role: UserRole;
  mustChangePassword: boolean;
}

export enum UserRole {
  superAdmin = "superAdmin",
  admin = "admin",
  dataOperator = "dataOperator",
  employee = "employee"
}

export interface EmployeeInfo {
  id: bigint;
  name: string;
  phone: string;
  role: string;
  salary: bigint;
}

export type InquiryStatus = { new_: null } | { followUp: null } | { closed: null };

export interface InquiryInfo {
  id: bigint;
  name: string;
  phone: string;
  requirement: string;
  status: InquiryStatus;
  createdAt: bigint;
}

export type AttendanceStatus = { present: null } | { absent: null } | { checkedIn: null };

export interface AttendanceRecord {
  id: bigint;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: bigint | null;
  checkOut: bigint | null;
  status: AttendanceStatus;
}

export interface backendInterface {
  _initializeAccessControlWithSecret(adminToken: string): Promise<void>;
  authenticate(username: string, password: string): Promise<UserInfo | null>;
  listUsers(requesterUsername: string, requesterPassword: string): Promise<Array<UserInfo>>;
  createUser(
    requesterUsername: string,
    requesterPassword: string,
    username: string,
    password: string,
    name: string,
    phone: string,
    role: UserRole
  ): Promise<void>;
  updateUser(
    requesterUsername: string,
    requesterPassword: string,
    username: string,
    name: string,
    phone: string,
    role: UserRole
  ): Promise<void>;
  deleteUser(
    requesterUsername: string,
    requesterPassword: string,
    username: string
  ): Promise<void>;
  changePassword(
    username: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void>;
  resetPassword(
    requesterUsername: string,
    requesterPassword: string,
    targetUsername: string,
    newPassword: string
  ): Promise<void>;
  resetPasswordByPhone(
    username: string,
    phone: string,
    newPassword: string
  ): Promise<void>;
  initializeDefaults(): Promise<void>;
  listEmployees(requesterUsername: string, requesterPassword: string): Promise<Array<EmployeeInfo>>;
  addEmployee(
    requesterUsername: string,
    requesterPassword: string,
    name: string,
    phone: string,
    role: string,
    salary: bigint
  ): Promise<bigint>;
  updateEmployee(
    requesterUsername: string,
    requesterPassword: string,
    id: bigint,
    name: string,
    phone: string,
    role: string,
    salary: bigint
  ): Promise<void>;
  deleteEmployee(
    requesterUsername: string,
    requesterPassword: string,
    id: bigint
  ): Promise<void>;
  listInquiries(requesterUsername: string, requesterPassword: string): Promise<Array<InquiryInfo>>;
  addInquiry(
    requesterUsername: string,
    requesterPassword: string,
    name: string,
    phone: string,
    requirement: string
  ): Promise<bigint>;
  updateInquiryStatus(
    requesterUsername: string,
    requesterPassword: string,
    id: bigint,
    status: InquiryStatus
  ): Promise<void>;
  deleteInquiry(
    requesterUsername: string,
    requesterPassword: string,
    id: bigint
  ): Promise<void>;
  // Attendance
  checkIn(username: string, password: string, date: string): Promise<AttendanceRecord>;
  checkOut(username: string, password: string, date: string): Promise<AttendanceRecord>;
  getMyAttendance(username: string, password: string, date: string): Promise<AttendanceRecord | null>;
  getEmployeeAttendance(
    requesterUsername: string,
    requesterPassword: string,
    employeeId: string
  ): Promise<Array<AttendanceRecord>>;
  getAttendanceByDate(
    requesterUsername: string,
    requesterPassword: string,
    date: string
  ): Promise<Array<AttendanceRecord>>;
  getAllAttendance(
    requesterUsername: string,
    requesterPassword: string
  ): Promise<Array<AttendanceRecord>>;
  markAbsent(
    requesterUsername: string,
    requesterPassword: string,
    employeeId: string,
    employeeName: string,
    date: string
  ): Promise<void>;
}
