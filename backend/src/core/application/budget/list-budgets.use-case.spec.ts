import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListBudgetsUseCase } from './list-budgets.use-case.js';
import { Budget } from '../../domain/budget/entities/budget.entity.js';
import { BudgetItem } from '../../domain/budget/entities/budget-item.entity.js';
import { BudgetStatus } from '../../domain/budget/value-objects/budget-status.vo.js';

describe('ListBudgetsUseCase', () => {
  let useCase: ListBudgetsUseCase;
  let budgetRepo: any;

  const item = BudgetItem.create(
    { budgetId: 'b-1', description: 'Item 1', quantity: 1, unitPrice: 100 },
    'bi-1',
  ).getValue();

  const mockBudget = Budget.create(
    {
      orgId: 'org-1',
      budgetNumber: 'ORC-2026-0001',
      title: 'Proposta Teste',
      customerId: 'cust-1',
      status: BudgetStatus.create('DRAFT').getValue(),
      issueDate: new Date(),
      validUntil: new Date(),
      items: [item],
      currency: 'BRL',
      discountAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'b-1',
  ).getValue();

  beforeEach(() => {
    budgetRepo = {
      findAllInOrg: vi.fn().mockResolvedValue([mockBudget]),
    };
    useCase = new ListBudgetsUseCase(budgetRepo);
  });

  it('should list all budgets for organization', async () => {
    const result = await useCase.execute('org-1');
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toHaveLength(1);
    expect(budgetRepo.findAllInOrg).toHaveBeenCalledWith('org-1', undefined);
  });
});
