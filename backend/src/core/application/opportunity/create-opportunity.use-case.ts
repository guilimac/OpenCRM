import { Inject, Injectable } from '@nestjs/common';
import {
  OPPORTUNITY_REPOSITORY_PORT,
  type IOpportunityRepository,
} from '../../domain/opportunity/opportunity.repository.port.js';
import { CACHE_PORT, type ICachePort } from '../common/ports/cache.port.js';
import { Opportunity } from '../../domain/opportunity/entities/opportunity.entity.js';
import { MonetaryValue } from '../../domain/opportunity/value-objects/monetary-value.vo.js';
import { OpportunityStage } from '../../domain/opportunity/value-objects/stage.vo.js';
import { Result } from '../../domain/common/result.js';
import { v4 as uuidv4 } from 'uuid';

export interface CreateOpportunityDto {
  orgId: string;
  customerId: string;
  ownerId: string;
  title: string;
  amount: number;
  currency?: string; // Default BRL
  exchangeRateToBrl?: number; // 1.0 for BRL
  stage?: string;
  expectedCloseDate: string; // ISO date string
}

@Injectable()
export class CreateOpportunityUseCase {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY_PORT)
    private readonly opportunityRepository: IOpportunityRepository,
    @Inject(CACHE_PORT)
    private readonly cachePort: ICachePort,
  ) {}

  async execute(dto: CreateOpportunityDto): Promise<Result<Opportunity>> {
    const currency = (dto.currency ?? 'BRL').toUpperCase();
    const rate = dto.exchangeRateToBrl ?? (currency === 'BRL' ? 1.0 : 5.5);

    const moneyResult = MonetaryValue.create(dto.amount, currency, rate);
    if (moneyResult.isFailure) {
      return Result.fail<Opportunity>(moneyResult.error!);
    }

    const stageResult = OpportunityStage.create(dto.stage ?? 'DISCOVERY');
    if (stageResult.isFailure) {
      return Result.fail<Opportunity>(stageResult.error!);
    }

    const closeDate = new Date(dto.expectedCloseDate);
    if (isNaN(closeDate.getTime())) {
      return Result.fail<Opportunity>('Invalid expected close date format');
    }

    const now = new Date();
    const opportunityResult = Opportunity.create(
      {
        orgId: dto.orgId,
        customerId: dto.customerId,
        ownerId: dto.ownerId,
        title: dto.title,
        monetaryValue: moneyResult.getValue(),
        stage: stageResult.getValue(),
        expectedCloseDate: closeDate,
        createdAt: now,
        updatedAt: now,
      },
      uuidv4(),
    );

    if (opportunityResult.isFailure) {
      return Result.fail<Opportunity>(opportunityResult.error!);
    }

    const opportunity = opportunityResult.getValue();
    await this.opportunityRepository.save(opportunity);

    // Evict pipeline summary cache
    await this.cachePort.del(`cache:org:${dto.orgId}:pipeline:summary`);

    return Result.ok<Opportunity>(opportunity);
  }
}
