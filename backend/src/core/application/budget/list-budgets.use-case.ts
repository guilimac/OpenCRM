import { Inject, Injectable } from '@nestjs/common';
import {
  BUDGET_REPOSITORY_PORT,
  type IBudgetRepository,
  type BudgetFilterOptions,
} from '../../domain/budget/budget.repository.port.js';
import { Budget } from '../../domain/budget/entities/budget.entity.js';
import { Result } from '../../domain/common/result.js';

@Injectable()
export class ListBudgetsUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY_PORT)
    private readonly budgetRepository: IBudgetRepository,
  ) {}

  async execute(orgId: string, options?: BudgetFilterOptions): Promise<Result<Budget[]>> {
    if (!orgId) {
      return Result.fail<Budget[]>('Organization ID is required');
    }

    const budgets = await this.budgetRepository.findAllInOrg(orgId, options);
    return Result.ok<Budget[]>(budgets);
  }
}
