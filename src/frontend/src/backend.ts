/* eslint-disable */
// @ts-nocheck
// This file was automatically generated. DO NOT EDIT.

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";

// ExternalBlob is kept so config.ts can import it without changes
export class ExternalBlob {
  private url: string | null;
  private blob: Uint8Array | null;
  public onProgress: ((percentage: number) => void) | undefined;

  constructor(url: string | null, blob: Uint8Array | null) {
    this.url = url;
    this.blob = blob;
  }

  static fromURL(url: string): ExternalBlob {
    return new ExternalBlob(url, null);
  }

  static fromBytes(blob: Uint8Array): ExternalBlob {
    const url = URL.createObjectURL(new Blob([blob]));
    return new ExternalBlob(url, blob);
  }

  getURL(): string | null {
    return this.url;
  }

  async getBytes(): Promise<Uint8Array> {
    if (this.blob) return this.blob;
    if (!this.url) throw new Error("No URL or bytes");
    const resp = await fetch(this.url);
    const buf = await resp.arrayBuffer();
    return new Uint8Array(buf);
  }

  public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
    this.onProgress = onProgress;
    return this;
  }
}

export enum UserRole {
  superAdmin = "superAdmin",
  admin = "admin",
  dataOperator = "dataOperator",
  employee = "employee"
}

export interface UserInfo {
  username: string;
  name: string;
  phone: string;
  role: UserRole;
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
  createUser(reqUser: string, reqPass: string, username: string, password: string, name: string, phone: string, role: UserRole): Promise<void>;
  updateUser(reqUser: string, reqPass: string, username: string, name: string, phone: string, role: UserRole): Promise<void>;
  deleteUser(reqUser: string, reqPass: string, username: string): Promise<void>;
  changePassword(username: string, oldPassword: string, newPassword: string): Promise<void>;
  resetPassword(reqUser: string, reqPass: string, targetUsername: string, newPassword: string): Promise<void>;
  initializeDefaults(): Promise<void>;
  listEmployees(requesterUsername: string, requesterPassword: string): Promise<Array<EmployeeInfo>>;
  addEmployee(reqUser: string, reqPass: string, name: string, phone: string, role: string, salary: bigint): Promise<bigint>;
  updateEmployee(reqUser: string, reqPass: string, id: bigint, name: string, phone: string, role: string, salary: bigint): Promise<void>;
  deleteEmployee(reqUser: string, reqPass: string, id: bigint): Promise<void>;
}

function toCandidRole(role: UserRole): any {
  switch (role) {
    case UserRole.superAdmin: return { superAdmin: null };
    case UserRole.admin: return { admin: null };
    case UserRole.dataOperator: return { dataOperator: null };
    case UserRole.employee: return { employee: null };
    default: return { employee: null };
  }
}

function fromCandidRole(r: any): UserRole {
  if ('superAdmin' in r) return UserRole.superAdmin;
  if ('admin' in r) return UserRole.admin;
  if ('dataOperator' in r) return UserRole.dataOperator;
  return UserRole.employee;
}

function fromCandidInfo(u: any): UserInfo {
  return { username: u.username, name: u.name, phone: u.phone, role: fromCandidRole(u.role) };
}

export class Backend implements backendInterface {
  constructor(private actor: ActorSubclass<_SERVICE>, private processError?: (error: unknown) => never) {}

  async _initializeAccessControlWithSecret(adminToken: string): Promise<void> {
    try {
      await (this.actor as any)._initializeAccessControlWithSecret(adminToken);
    } catch {
      // no-op if not available
    }
  }

  async authenticate(username: string, password: string): Promise<UserInfo | null> {
    console.log('[authenticate] request:', { username });
    try {
      const result = await this.actor.authenticate(username, password);
      const value = result.length === 0 ? null : fromCandidInfo(result[0]);
      console.log('[authenticate] response:', value);
      return value;
    } catch (e) {
      console.error('[authenticate] error:', e);
      if (this.processError) this.processError(e);
      throw e;
    }
  }

  async listUsers(reqUser: string, reqPass: string): Promise<Array<UserInfo>> {
    const result = await this.actor.listUsers(reqUser, reqPass);
    return result.map(fromCandidInfo);
  }

  async createUser(reqUser: string, reqPass: string, username: string, password: string, name: string, phone: string, role: UserRole): Promise<void> {
    await this.actor.createUser(reqUser, reqPass, username, password, name, phone, toCandidRole(role));
  }

  async updateUser(reqUser: string, reqPass: string, username: string, name: string, phone: string, role: UserRole): Promise<void> {
    await this.actor.updateUser(reqUser, reqPass, username, name, phone, toCandidRole(role));
  }

  async deleteUser(reqUser: string, reqPass: string, username: string): Promise<void> {
    await this.actor.deleteUser(reqUser, reqPass, username);
  }

  async changePassword(username: string, oldPassword: string, newPassword: string): Promise<void> {
    await this.actor.changePassword(username, oldPassword, newPassword);
  }

  async resetPassword(reqUser: string, reqPass: string, targetUsername: string, newPassword: string): Promise<void> {
    await this.actor.resetPassword(reqUser, reqPass, targetUsername, newPassword);
  }

  async initializeDefaults(): Promise<void> {
    console.log('[initializeDefaults] seeding default users...');
    await this.actor.initializeDefaults();
    console.log('[initializeDefaults] done');
  }

  async listEmployees(reqUser: string, reqPass: string): Promise<Array<EmployeeInfo>> {
    const result = await (this.actor as any).listEmployees(reqUser, reqPass);
    return result.map((e: any) => ({
      id: BigInt(e.id),
      name: e.name,
      phone: e.phone,
      role: e.role,
      salary: BigInt(e.salary),
    }));
  }

  async addEmployee(reqUser: string, reqPass: string, name: string, phone: string, role: string, salary: bigint): Promise<bigint> {
    const result = await (this.actor as any).addEmployee(reqUser, reqPass, name, phone, role, salary);
    return BigInt(result);
  }

  async updateEmployee(reqUser: string, reqPass: string, id: bigint, name: string, phone: string, role: string, salary: bigint): Promise<void> {
    await (this.actor as any).updateEmployee(reqUser, reqPass, id, name, phone, role, salary);
  }

  async deleteEmployee(reqUser: string, reqPass: string, id: bigint): Promise<void> {
    await (this.actor as any).deleteEmployee(reqUser, reqPass, id);
  }
}

export interface CreateActorOptions {
  agent?: Agent;
  agentOptions?: HttpAgentOptions;
  actorOptions?: ActorConfig;
  processError?: (error: unknown) => never;
}

export function createActor(canisterId: string, _uploadFile: any, _downloadFile: any, options: CreateActorOptions = {}): Backend {
  const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
  const actor = Actor.createActor<_SERVICE>(idlFactory, { agent, canisterId, ...options.actorOptions });
  return new Backend(actor, options.processError);
}
