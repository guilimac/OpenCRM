import { User } from './user.entity.js';

export const USER_REPOSITORY_PORT = Symbol('USER_REPOSITORY_PORT');

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(orgId: string, email: string): Promise<User | null>;
  findByEmailGlobal(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
}
