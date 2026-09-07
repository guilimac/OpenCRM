import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateBudgetUseCase } from './create-budget.use-case.js';

describe('CreateBudgetUseCase', () => {
  let useCase: CreateBudgetUseCase;
  let budgetRepo: any;

  beforeEach(() => {
    budgetRepo = {
      generateNextNumber: vi.fn().mockResolvedValue('ORC-2026-0001'),
      save: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new CreateBudgetUseCase(budgetRepo);
  });

  it('should successfully create a new budget with items and calculated totals', async () => {
    const result = await useCase.execute({
      orgId: 'org-1',
      title: 'Proposta Comercial - CRM Enterprise',
      customerId: 'cust-1',
      items: [
        {
          description: 'Licença Software',
          quantity: 2,
          unitPrice: 1000,
          discountPercent: 10, // 2000 - 10% = 1800
        },
        {
          description: 'Implantação e Treinamento',
          quantity: 1,
          unitPrice: 500,
          discountPercent: 0, // 500
        },
      ],
      discountAmount: 100, // 2300 - 100 = 2200
    });

    expect(result.isSuccess).toBe(true);
    const budget = result.getValue();
    expect(budget.budgetNumber).toBe('ORC-2026-0001');
    expect(budget.subtotal).toBe(2300);
    expect(budget.discountAmount).toBe(100);
    expect(budget.totalAmount).toBe(2200);
    expect(budget.status.value).toBe('DRAFT');
    expect(budgetRepo.save).toHaveBeenCalled();
  });

  it('should fail if no items are provided', async () => {
    const result = await useCase.execute({
      orgId: 'org-1',
      title: 'Proposta Vazia',
      customerId: 'cust-1',
      items: [],
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('at least one line item');
  });
});
