import { Opportunity } from './entities/opportunity.entity.js';
import { OpportunityStageType } from './value-objects/stage.vo.js';

export const OPPORTUNITY_REPOSITORY_PORT = Symbol('OPPORTUNITY_REPOSITORY_PORT');

export interface PipelineSummaryItem {
  stage: OpportunityStageType;
  count: number;
  totalAmountInBrl: number;
  weightedAmountInBrl: number;
}

export interface IOpportunityRepository {
  findById(orgId: string, id: string): Promise<Opportunity | null>;
  findByCustomer(orgId: string, customerId: string): Promise<Opportunity[]>;
  findByOwner(orgId: string, ownerId: string): Promise<Opportunity[]>;
  findAllInOrg(orgId: string): Promise<Opportunity[]>;
  getPipelineSummary(orgId: string): Promise<PipelineSummaryItem[]>;
  save(opportunity: Opportunity): Promise<void>;
  update(opportunity: Opportunity): Promise<void>;
  delete(orgId: string, id: string): Promise<void>;
}
