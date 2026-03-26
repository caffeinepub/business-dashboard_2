import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type UserRole = { 'superAdmin': null } | { 'admin': null } | { 'dataOperator': null } | { 'employee': null };
export interface UserInfo {
  username: string;
  name: string;
  phone: string;
  role: UserRole;
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
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
