import { Inject, Injectable } from '@nestjs/common';
import {
  BUDGET_REPOSITORY_PORT,
  type IBudgetRepository,
} from '../../domain/budget/budget.repository.port.js';
import { BudgetStatus, type BudgetStatusType } from '../../domain/budget/value-objects/budget-status.vo.js';
import { Budget } from '../../domain/budget/entities/budget.entity.js';
import { Result } from '../../domain/common/result.js';

export interface UpdateBudgetStatusCommand {
  orgId: string;
  id: string;
  status: BudgetStatusType;
}

@Injectable()
export class UpdateBudgetStatusUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY_PORT)
    private readonly budgetRepository: IBudgetRepository,
  ) {}

  async execute(command: UpdateBudgetStatusCommand): Promise<Result<Budget>> {
    const budget = await this.budgetRepository.findById(command.orgId, command.id);
    if (!budget) {
      return Result.fail<Budget>('Budget not found');
    }

    const statusRes = BudgetStatus.create(command.status);
    if (statusRes.isFailure) {
      return Result.fail<Budget>(statusRes.error!);
    }

    budget.changeStatus(statusRes.getValue());
    await this.budgetRepository.save(budget);
    return Result.ok<Budget>(budget);
  }
}
