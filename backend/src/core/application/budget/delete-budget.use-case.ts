import { Inject, Injectable } from '@nestjs/common';
import {
  BUDGET_REPOSITORY_PORT,
  type IBudgetRepository,
} from '../../domain/budget/budget.repository.port.js';
import { Result } from '../../domain/common/result.js';

@Injectable()
export class DeleteBudgetUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY_PORT)
    private readonly budgetRepository: IBudgetRepository,
  ) {}

  async execute(orgId: string, id: string): Promise<Result<void>> {
    const budget = await this.budgetRepository.findById(orgId, id);
    if (!budget) {
      return Result.fail<void>('Budget not found');
    }

    await this.budgetRepository.delete(orgId, id);
    return Result.ok<void>();
  }
}
