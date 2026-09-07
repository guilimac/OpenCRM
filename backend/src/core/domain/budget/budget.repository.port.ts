import { Budget } from './entities/budget.entity.js';

export const BUDGET_REPOSITORY_PORT = Symbol('BUDGET_REPOSITORY_PORT');

export interface BudgetFilterOptions {
  customerId?: string;
  opportunityId?: string;
  status?: string;
  search?: string;
}

export interface IBudgetRepository {
  findById(orgId: string, id: string): Promise<Budget | null>;
  findByNumber(orgId: string, budgetNumber: string): Promise<Budget | null>;
  findAllInOrg(orgId: string, options?: BudgetFilterOptions): Promise<Budget[]>;
  findByCustomer(orgId: string, customerId: string): Promise<Budget[]>;
  generateNextNumber(orgId: string): Promise<string>;
  save(budget: Budget): Promise<void>;
  update(budget: Budget): Promise<void>;
  delete(orgId: string, id: string): Promise<void>;
}
