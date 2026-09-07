import { Inject, Injectable } from '@nestjs/common';
import {
  OPPORTUNITY_REPOSITORY_PORT,
  type IOpportunityRepository,
  type PipelineSummaryItem,
} from '../../domain/opportunity/opportunity.repository.port.js';
import { CACHE_PORT, type ICachePort } from '../common/ports/cache.port.js';
import { Result } from '../../domain/common/result.js';

export interface PipelineSummaryResponse {
  currency: string;
  totalPipelineValueInBrl: number;
  totalWeightedValueInBrl: number;
  stages: PipelineSummaryItem[];
}

@Injectable()
export class GetPipelineSummaryUseCase {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY_PORT)
    private readonly opportunityRepository: IOpportunityRepository,
    @Inject(CACHE_PORT)
    private readonly cachePort: ICachePort,
  ) {}

  async execute(orgId: string): Promise<Result<PipelineSummaryResponse>> {
    const cacheKey = `cache:org:${orgId}:pipeline:summary`;
    const cached = await this.cachePort.get<PipelineSummaryResponse>(cacheKey);
    if (cached) {
      return Result.ok<PipelineSummaryResponse>(cached);
    }

    const stages = await this.opportunityRepository.getPipelineSummary(orgId);

    const totalPipelineValueInBrl = Math.round(
      stages.reduce((sum, item) => sum + item.totalAmountInBrl, 0) * 100,
    ) / 100;

    const totalWeightedValueInBrl = Math.round(
      stages.reduce((sum, item) => sum + item.weightedAmountInBrl, 0) * 100,
    ) / 100;

    const summary: PipelineSummaryResponse = {
      currency: 'BRL',
      totalPipelineValueInBrl,
      totalWeightedValueInBrl,
      stages,
    };

    // Cache for 5 minutes (300 seconds)
    await this.cachePort.set(cacheKey, summary, 300);

    return Result.ok<PipelineSummaryResponse>(summary);
  }
}
