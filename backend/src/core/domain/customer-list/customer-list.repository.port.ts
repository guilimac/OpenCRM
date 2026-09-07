import { CustomerList } from './customer-list.entity.js';

export const CUSTOMER_LIST_REPOSITORY_PORT = Symbol('CUSTOMER_LIST_REPOSITORY_PORT');

export interface ICustomerListRepository {
  findById(orgId: string, id: string): Promise<CustomerList | null>;
  findByOrg(orgId: string): Promise<CustomerList[]>;
  save(list: CustomerList): Promise<void>;
  update(list: CustomerList): Promise<void>;
  delete(orgId: string, id: string): Promise<void>;
}
