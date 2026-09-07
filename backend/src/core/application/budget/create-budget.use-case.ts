import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  BUDGET_REPOSITORY_PORT,
  type IBudgetRepository,
} from '../../domain/budget/budget.repository.port.js';
import { Budget } from '../../domain/budget/entities/budget.entity.js';
import { BudgetItem } from '../../domain/budget/entities/budget-item.entity.js';
import { BudgetStatus } from '../../domain/budget/value-objects/budget-status.vo.js';
import { Result } from '../../domain/common/result.js';

export interface CreateBudgetItemDto {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
}

export interface CreateBudgetCommand {
  orgId: string;
  title: string;
  customerId: string;
  opportunityId?: string;
  issueDate?: Date;
  validUntil?: Date;
  items: CreateBudgetItemDto[];
  discountAmount?: number;
  currency?: string;
  paymentTerms?: string;
  notes?: string;
}

@Injectable()
export class CreateBudgetUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY_PORT)
    private readonly budgetRepository: IBudgetRepository,
  ) {}

  async execute(command: CreateBudgetCommand): Promise<Result<Budget>> {
    if (!command.orgId) {
      return Result.fail<Budget>('Organization ID is required');
    }
    if (!command.customerId) {
      return Result.fail<Budget>('Customer ID is required');
    }
    if (!command.title || command.title.trim().length === 0) {
      return Result.fail<Budget>('Budget title is required');
    }
    if (!command.items || command.items.length === 0) {
      return Result.fail<Budget>('Budget must have at least one line item');
    }

    const budgetId = uuidv4();
    const budgetNumber = await this.budgetRepository.generateNextNumber(command.orgId);

    const budgetItems: BudgetItem[] = [];
    for (const itemDto of command.items) {
      const itemRes = BudgetItem.create(
        {
          budgetId,
          productId: itemDto.productId || null,
          description: itemDto.description,
          quantity: itemDto.quantity,
          unitPrice: itemDto.unitPrice,
          discountPercent: itemDto.discountPercent || 0,
        },
        uuidv4(),
      );
      if (itemRes.isFailure) {
        return Result.fail<Budget>(itemRes.error!);
      }
      budgetItems.push(itemRes.getValue());
    }

    const issueDate = command.issueDate ? new Date(command.issueDate) : new Date();
    const validUntil = command.validUntil
      ? new Date(command.validUntil)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    const budgetResult = Budget.create(
      {
        orgId: command.orgId,
        budgetNumber,
        title: command.title,
        customerId: command.customerId,
        opportunityId: command.opportunityId || null,
        status: BudgetStatus.create('DRAFT').getValue(),
        issueDate,
        validUntil,
        items: budgetItems,
        discountAmount: command.discountAmount || 0,
        currency: command.currency || 'BRL',
        paymentTerms: command.paymentTerms || null,
        notes: command.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      budgetId,
    );

    if (budgetResult.isFailure) {
      return Result.fail<Budget>(budgetResult.error!);
    }

    const budget = budgetResult.getValue();
    await this.budgetRepository.save(budget);
    return Result.ok<Budget>(budget);
  }
}
