import { Customer } from './entities/customer.entity.js';

export const CUSTOMER_REPOSITORY_PORT = Symbol('CUSTOMER_REPOSITORY_PORT');

export interface CustomerFindOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  assignedOwnerId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICustomerRepository {
  findById(orgId: string, id: string): Promise<Customer | null>;
  findMany(orgId: string, options: CustomerFindOptions): Promise<PaginatedResult<Customer>>;
  save(customer: Customer): Promise<void>;
  update(customer: Customer): Promise<void>;
  delete(orgId: string, id: string): Promise<void>;
}
