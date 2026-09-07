import { Inject, Injectable } from '@nestjs/common';
import {
  OPPORTUNITY_REPOSITORY_PORT,
  type IOpportunityRepository,
} from '../../domain/opportunity/opportunity.repository.port.js';
import { CACHE_PORT, type ICachePort } from '../common/ports/cache.port.js';
import { OpportunityStage } from '../../domain/opportunity/value-objects/stage.vo.js';
import { Opportunity } from '../../domain/opportunity/entities/opportunity.entity.js';
import { Result } from '../../domain/common/result.js';

export interface UpdateOpportunityStageDto {
  orgId: string;
  opportunityId: string;
  stage: string;
  lossReason?: string;
}

@Injectable()
export class UpdateOpportunityStageUseCase {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY_PORT)
    private readonly opportunityRepository: IOpportunityRepository,
    @Inject(CACHE_PORT)
    private readonly cachePort: ICachePort,
  ) {}

  async execute(dto: UpdateOpportunityStageDto): Promise<Result<Opportunity>> {
    const opportunity = await this.opportunityRepository.findById(dto.orgId, dto.opportunityId);
    if (!opportunity) {
      return Result.fail<Opportunity>('Opportunity not found');
    }

    const stageResult = OpportunityStage.create(dto.stage);
    if (stageResult.isFailure) {
      return Result.fail<Opportunity>(stageResult.error!);
    }

    const changeResult = opportunity.changeStage(stageResult.getValue(), dto.lossReason);
    if (changeResult.isFailure) {
      return Result.fail<Opportunity>(changeResult.error!);
    }

    await this.opportunityRepository.update(opportunity);

    // Invalidate pipeline cache
    await this.cachePort.del(`cache:org:${dto.orgId}:pipeline:summary`);

    return Result.ok<Opportunity>(opportunity);
  }
}
