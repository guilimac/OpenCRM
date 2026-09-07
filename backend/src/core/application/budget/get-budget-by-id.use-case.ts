import { Inject, Injectable } from '@nestjs/common';
import {
  BUDGET_REPOSITORY_PORT,
  type IBudgetRepository,
} from '../../domain/budget/budget.repository.port.js';
import { Budget } from '../../domain/budget/entities/budget.entity.js';
import { Result } from '../../domain/common/result.js';

@Injectable()
export class GetBudgetByIdUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY_PORT)
    private readonly budgetRepository: IBudgetRepository,
  ) {}

  async execute(orgId: string, id: string): Promise<Result<Budget>> {
    const budget = await this.budgetRepository.findById(orgId, id);
    if (!budget) {
      return Result.fail<Budget>('Budget not found');
    }

    return Result.ok<Budget>(budget);
  }
}
