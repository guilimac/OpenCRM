import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  type IOpportunityRepository,
  type PipelineSummaryItem,
} from '../../../../../../core/domain/opportunity/opportunity.repository.port.js';
import { Opportunity } from '../../../../../../core/domain/opportunity/entities/opportunity.entity.js';
import { OpportunityStageType } from '../../../../../../core/domain/opportunity/value-objects/stage.vo.js';
import { OpportunityOrmEntity } from '../entities/opportunity.orm-entity.js';
import { OpportunityMapper } from '../mappers/opportunity.mapper.js';

@Injectable()
export class TypeOrmOpportunityRepository implements IOpportunityRepository {
  constructor(
    @InjectRepository(OpportunityOrmEntity)
    private readonly repo: Repository<OpportunityOrmEntity>,
  ) {}

  async findById(orgId: string, id: string): Promise<Opportunity | null> {
    const orm = await this.repo.findOne({ where: { orgId, id } });
    return orm ? OpportunityMapper.toDomain(orm) : null;
  }

  async findByCustomer(orgId: string, customerId: string): Promise<Opportunity[]> {
    const items = await this.repo.find({
      where: { orgId, customerId },
      order: { createdAt: 'DESC' },
    });
    return items.map((item) => OpportunityMapper.toDomain(item));
  }

  async findByOwner(orgId: string, ownerId: string): Promise<Opportunity[]> {
    const items = await this.repo.find({
      where: { orgId, ownerId },
      order: { expectedCloseDate: 'ASC' },
    });
    return items.map((item) => OpportunityMapper.toDomain(item));
  }

  async findAllInOrg(orgId: string): Promise<Opportunity[]> {
    const items = await this.repo.find({
      where: { orgId },
      order: { createdAt: 'DESC' },
    });
    return items.map((item) => OpportunityMapper.toDomain(item));
  }

  async getPipelineSummary(orgId: string): Promise<PipelineSummaryItem[]> {
    // Pipeline summary aggregates amount converted to BRL (amount * exchangeRateToBrl)
    const raw = await this.repo
      .createQueryBuilder('opp')
      .select('opp.stage', 'stage')
      .addSelect('COUNT(opp.id)', 'count')
      .addSelect('SUM(opp.amount * opp.exchangeRateToBrl)', 'totalAmountInBrl')
      .addSelect('SUM((opp.amount * opp.exchangeRateToBrl) * (opp.probability / 100))', 'weightedAmountInBrl')
      .where('opp.orgId = :orgId', { orgId })
      .groupBy('opp.stage')
      .getRawMany();

    const stages: OpportunityStageType[] = [
      'DISCOVERY',
      'QUALIFICATION',
      'PROPOSAL',
      'NEGOTIATION',
      'CLOSED_WON',
      'CLOSED_LOST',
    ];

    return stages.map((stage) => {
      const match = raw.find((r) => r.stage === stage);
      return {
        stage,
        count: match ? Number(match.count) : 0,
        totalAmountInBrl: match ? Math.round(Number(match.totalAmountInBrl) * 100) / 100 : 0,
        weightedAmountInBrl: match ? Math.round(Number(match.weightedAmountInBrl) * 100) / 100 : 0,
      };
    });
  }

  async save(opportunity: Opportunity): Promise<void> {
    const orm = OpportunityMapper.toOrm(opportunity);
    await this.repo.save(orm);
  }

  async update(opportunity: Opportunity): Promise<void> {
    const orm = OpportunityMapper.toOrm(opportunity);
    await this.repo.save(orm);
  }

  async delete(orgId: string, id: string): Promise<void> {
    await this.repo.delete({ orgId, id });
  }
}
