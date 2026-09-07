import { Inject, Injectable } from '@nestjs/common';
import {
  OPPORTUNITY_REPOSITORY_PORT,
  type IOpportunityRepository,
} from '../../domain/opportunity/opportunity.repository.port.js';
import { Opportunity } from '../../domain/opportunity/entities/opportunity.entity.js';
import { Result } from '../../domain/common/result.js';

@Injectable()
export class ListOpportunitiesUseCase {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY_PORT)
    private readonly opportunityRepository: IOpportunityRepository,
  ) {}

  async execute(orgId: string): Promise<Result<Opportunity[]>> {
    if (!orgId) {
      return Result.fail<Opportunity[]>('Organization ID is required');
    }

    const opportunities = await this.opportunityRepository.findAllInOrg(orgId);
    return Result.ok<Opportunity[]>(opportunities);
  }
}
