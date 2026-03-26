export interface UserInfo {
  username: string;
  name: string;
  phone: string;
  role: UserRole;
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
}
