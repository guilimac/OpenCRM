import { describe, it, expect } from 'vitest';
import { Budget } from './budget.entity.js';
import { BudgetItem } from './budget-item.entity.js';
import { BudgetStatus } from '../value-objects/budget-status.vo.js';

describe('Budget Entity', () => {
  const item1 = BudgetItem.create(
    {
      budgetId: 'b-1',
      productId: 'p-1',
      description: 'Consultoria Cloud',
      quantity: 10,
      unitPrice: 200,
      discountPercent: 10, // 2000 - 10% = 1800
    },
    'bi-1',
  ).getValue();

  const item2 = BudgetItem.create(
    {
      budgetId: 'b-1',
      productId: 'p-2',
      description: 'Licença Software',
      quantity: 5,
      unitPrice: 100,
      discountPercent: 0, // 500
    },
    'bi-2',
  ).getValue();

  it('should create a budget and compute subtotal, discount, and total correctly', () => {
    const result = Budget.create(
      {
        orgId: 'org-1',
        budgetNumber: 'ORC-2026-0001',
        title: 'Proposta de Modernização TI',
        customerId: 'cust-1',
        status: BudgetStatus.create('DRAFT').getValue(),
        issueDate: new Date('2026-09-01'),
        validUntil: new Date('2026-09-30'),
        items: [item1, item2],
        discountAmount: 100, // Global discount
        currency: 'BRL',
        paymentTerms: '30 dias',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'b-1',
    );

    expect(result.isSuccess).toBe(true);
    const budget = result.getValue();
    expect(budget.id).toBe('b-1');
    expect(budget.subtotal).toBe(2300); // 1800 + 500
    expect(budget.discountAmount).toBe(100);
    expect(budget.totalAmount).toBe(2200); // 2300 - 100
    expect(budget.status.value).toBe('DRAFT');
  });

  it('should transition status successfully', () => {
    const budget = Budget.create(
      {
        orgId: 'org-1',
        budgetNumber: 'ORC-2026-0002',
        title: 'Proposta 2',
        customerId: 'cust-1',
        status: BudgetStatus.create('DRAFT').getValue(),
        issueDate: new Date(),
        validUntil: new Date(),
        items: [item1],
        currency: 'BRL',
        discountAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'b-2',
    ).getValue();

    budget.changeStatus(BudgetStatus.create('APPROVED').getValue());
    expect(budget.status.value).toBe('APPROVED');
    expect(budget.status.isApproved).toBe(true);
  });

  it('should fail creation when items array is empty', () => {
    const result = Budget.create(
      {
        orgId: 'org-1',
        budgetNumber: 'ORC-2026-0003',
        title: 'Sem itens',
        customerId: 'cust-1',
        status: BudgetStatus.create('DRAFT').getValue(),
        issueDate: new Date(),
        validUntil: new Date(),
        items: [],
        currency: 'BRL',
        discountAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'b-3',
    );

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('at least one item');
  });
});
