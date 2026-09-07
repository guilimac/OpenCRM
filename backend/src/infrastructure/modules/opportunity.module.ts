import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OPPORTUNITY_REPOSITORY_PORT } from '../../core/domain/opportunity/opportunity.repository.port.js';
import { OpportunityOrmEntity } from '../adapters/secondary/persistence/mysql/entities/opportunity.orm-entity.js';
import { TypeOrmOpportunityRepository } from '../adapters/secondary/persistence/mysql/repositories/typeorm-opportunity.repository.js';
import { CreateOpportunityUseCase } from '../../core/application/opportunity/create-opportunity.use-case.js';
import { UpdateOpportunityStageUseCase } from '../../core/application/opportunity/update-opportunity-stage.use-case.js';
import { GetPipelineSummaryUseCase } from '../../core/application/opportunity/get-pipeline-summary.use-case.js';
import { ListOpportunitiesUseCase } from '../../core/application/opportunity/list-opportunities.use-case.js';
import { OpportunityController } from '../adapters/primary/rest/opportunity/opportunity.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([OpportunityOrmEntity])],
  controllers: [OpportunityController],
  providers: [
    {
      provide: OPPORTUNITY_REPOSITORY_PORT,
      useClass: TypeOrmOpportunityRepository,
    },
    CreateOpportunityUseCase,
    UpdateOpportunityStageUseCase,
    GetPipelineSummaryUseCase,
    ListOpportunitiesUseCase,
  ],
  exports: [OPPORTUNITY_REPOSITORY_PORT],
})
export class OpportunityModule {}
