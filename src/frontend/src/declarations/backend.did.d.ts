import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type UserRole = { 'superAdmin': null } | { 'admin': null } | { 'dataOperator': null } | { 'employee': null };
export interface UserInfo {
  username: string;
  name: string;
  phone: string;
  role: UserRole;
  mustChangePassword: boolean;
}
export interface EmployeeInfo {
  id: bigint;
  name: string;
  phone: string;
  role: string;
  salary: bigint;
}
export type InquiryStatus = { 'new_': null } | { 'followUp': null } | { 'closed': null };
export interface InquiryInfo {
  id: bigint;
  name: string;
  phone: string;
  requirement: string;
  status: InquiryStatus;
  createdAt: bigint;
}
export interface _SERVICE {
  authenticate: ActorMethod<[string, string], [] | [UserInfo]>;
  listUsers: ActorMethod<[string, string], Array<UserInfo>>;
  createUser: ActorMethod<[string, string, string, string, string, string, UserRole], undefined>;
  updateUser: ActorMethod<[string, string, string, string, string, UserRole], undefined>;
  deleteUser: ActorMethod<[string, string, string], undefined>;
  changePassword: ActorMethod<[string, string, string], undefined>;
  resetPassword: ActorMethod<[string, string, string, string], undefined>;
  initializeDefaults: ActorMethod<[], undefined>;
  listEmployees: ActorMethod<[string, string], Array<EmployeeInfo>>;
  addEmployee: ActorMethod<[string, string, string, string, string, bigint], bigint>;
  updateEmployee: ActorMethod<[string, string, bigint, string, string, string, bigint], undefined>;
  deleteEmployee: ActorMethod<[string, string, bigint], undefined>;
  listInquiries: ActorMethod<[string, string], Array<InquiryInfo>>;
  addInquiry: ActorMethod<[string, string, string, string, string], bigint>;
  updateInquiryStatus: ActorMethod<[string, string, bigint, InquiryStatus], undefined>;
  deleteInquiry: ActorMethod<[string, string, bigint], undefined>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
