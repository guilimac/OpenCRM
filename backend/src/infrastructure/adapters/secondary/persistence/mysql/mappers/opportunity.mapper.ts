import { Opportunity } from '../../../../../../core/domain/opportunity/entities/opportunity.entity.js';
import { MonetaryValue } from '../../../../../../core/domain/opportunity/value-objects/monetary-value.vo.js';
import { OpportunityStage } from '../../../../../../core/domain/opportunity/value-objects/stage.vo.js';
import { OpportunityOrmEntity } from '../entities/opportunity.orm-entity.js';

export class OpportunityMapper {
  static toDomain(orm: OpportunityOrmEntity): Opportunity {
    const moneyResult = MonetaryValue.create(
      Number(orm.amount),
      orm.currency,
      Number(orm.exchangeRateToBrl),
    );
    const stageResult = OpportunityStage.create(orm.stage, orm.probability);

    const oppResult = Opportunity.create(
      {
        orgId: orm.orgId,
        customerId: orm.customerId,
        ownerId: orm.ownerId,
        title: orm.title,
        monetaryValue: moneyResult.getValue(),
        stage: stageResult.getValue(),
        expectedCloseDate: new Date(orm.expectedCloseDate),
        closedAt: orm.closedAt,
        lossReason: orm.lossReason,
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
      },
      orm.id,
    );

    return oppResult.getValue();
  }

  static toOrm(domain: Opportunity): OpportunityOrmEntity {
    const orm = new OpportunityOrmEntity();
    orm.id = domain.id;
    orm.orgId = domain.orgId;
    orm.customerId = domain.customerId;
    orm.ownerId = domain.ownerId;
    orm.title = domain.title;
    orm.amount = domain.monetaryValue.amount;
    orm.currency = domain.monetaryValue.currency;
    orm.exchangeRateToBrl = domain.monetaryValue.exchangeRateToBrl;
    orm.stage = domain.stage.value;
    orm.probability = domain.stage.probability;
    orm.expectedCloseDate = domain.expectedCloseDate;
    orm.closedAt = domain.closedAt;
    orm.lossReason = domain.lossReason;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
