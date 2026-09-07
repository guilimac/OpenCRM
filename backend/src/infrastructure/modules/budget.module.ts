import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BUDGET_REPOSITORY_PORT } from '../../core/domain/budget/budget.repository.port.js';
import { BudgetOrmEntity } from '../adapters/secondary/persistence/mysql/entities/budget.orm-entity.js';
import { BudgetItemOrmEntity } from '../adapters/secondary/persistence/mysql/entities/budget-item.orm-entity.js';
import { TypeOrmBudgetRepository } from '../adapters/secondary/persistence/mysql/repositories/typeorm-budget.repository.js';
import { CreateBudgetUseCase } from '../../core/application/budget/create-budget.use-case.js';
import { ListBudgetsUseCase } from '../../core/application/budget/list-budgets.use-case.js';
import { GetBudgetByIdUseCase } from '../../core/application/budget/get-budget-by-id.use-case.js';
import { UpdateBudgetStatusUseCase } from '../../core/application/budget/update-budget-status.use-case.js';
import { DeleteBudgetUseCase } from '../../core/application/budget/delete-budget.use-case.js';
import { BudgetController } from '../adapters/primary/rest/budget/budget.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([BudgetOrmEntity, BudgetItemOrmEntity])],
  controllers: [BudgetController],
  providers: [
    {
      provide: BUDGET_REPOSITORY_PORT,
      useClass: TypeOrmBudgetRepository,
    },
    CreateBudgetUseCase,
    ListBudgetsUseCase,
    GetBudgetByIdUseCase,
    UpdateBudgetStatusUseCase,
    DeleteBudgetUseCase,
  ],
  exports: [BUDGET_REPOSITORY_PORT],
})
export class BudgetModule {}
