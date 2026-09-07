import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListOpportunitiesUseCase } from './list-opportunities.use-case.js';
import { Opportunity } from '../../domain/opportunity/entities/opportunity.entity.js';
import { MonetaryValue } from '../../domain/opportunity/value-objects/monetary-value.vo.js';
import { OpportunityStage } from '../../domain/opportunity/value-objects/stage.vo.js';

describe('ListOpportunitiesUseCase', () => {
  let useCase: ListOpportunitiesUseCase;
  let opportunityRepo: any;

  const mockOpportunity = Opportunity.create(
    {
      orgId: 'org-1',
      customerId: 'cust-1',
      ownerId: 'user-1',
      title: 'Enterprise ERP Deal',
      monetaryValue: MonetaryValue.create(50000, 'USD', 5.0).getValue(),
      stage: OpportunityStage.create('PROPOSAL').getValue(),
      expectedCloseDate: new Date('2026-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'opp-1',
  ).getValue();

  beforeEach(() => {
    opportunityRepo = {
      findAllInOrg: vi.fn().mockResolvedValue([mockOpportunity]),
    };

    useCase = new ListOpportunitiesUseCase(opportunityRepo);
  });

  it('should successfully return all opportunities for an organization', async () => {
    const result = await useCase.execute('org-1');

    expect(result.isSuccess).toBe(true);
    const opportunities = result.getValue();
    expect(opportunities).toHaveLength(1);
    expect(opportunities[0].id).toBe('opp-1');
    expect(opportunities[0].title).toBe('Enterprise ERP Deal');
    expect(opportunities[0].monetaryValue.amountInBrl).toBe(250000);
    expect(opportunityRepo.findAllInOrg).toHaveBeenCalledWith('org-1');
  });

  it('should return error if orgId is missing', async () => {
    const result = await useCase.execute('');

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Organization ID is required');
    expect(opportunityRepo.findAllInOrg).not.toHaveBeenCalled();
  });
});
