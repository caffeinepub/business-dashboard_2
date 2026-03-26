import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    principal: Principal;
    username: string;
    role: UserRole;
}
export interface Registration {
    username: string;
    password: string;
    role: UserRole;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticate(username: string, password: string): Promise<UserProfile | null>;
    getAllProfiles(): Promise<Array<UserProfile>>;
    getAllRegistrationsSorted(): Promise<Array<Registration>>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    initializeActorAdmin(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listAllUserProfiles(): Promise<Array<UserProfile>>;
    register(username: string, password: string, role: UserRole): Promise<void>;
}
