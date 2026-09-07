import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateBudgetStatusUseCase } from './update-budget-status.use-case.js';
import { Budget } from '../../domain/budget/entities/budget.entity.js';
import { BudgetItem } from '../../domain/budget/entities/budget-item.entity.js';
import { BudgetStatus } from '../../domain/budget/value-objects/budget-status.vo.js';

describe('UpdateBudgetStatusUseCase', () => {
  let useCase: UpdateBudgetStatusUseCase;
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
      findById: vi.fn().mockResolvedValue(mockBudget),
      save: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new UpdateBudgetStatusUseCase(budgetRepo);
  });

  it('should update budget status to APPROVED', async () => {
    const result = await useCase.execute({
      orgId: 'org-1',
      id: 'b-1',
      status: 'APPROVED',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status.value).toBe('APPROVED');
    expect(budgetRepo.save).toHaveBeenCalled();
  });

  it('should fail with invalid status', async () => {
    const result = await useCase.execute({
      orgId: 'org-1',
      id: 'b-1',
      status: 'INVALID_STATUS' as any,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Invalid budget status');
  });
});
