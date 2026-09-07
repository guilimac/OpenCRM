import { Interaction, type InteractionType } from '../../../../../../core/domain/interaction/interaction.entity.js';
import { InteractionOrmEntity } from '../entities/interaction.orm-entity.js';

export class InteractionMapper {
  static toDomain(orm: InteractionOrmEntity): Interaction {
    const result = Interaction.create(
      {
        orgId: orm.orgId,
        userId: orm.userId,
        customerId: orm.customerId,
        contactId: orm.contactId,
        opportunityId: orm.opportunityId,
        type: orm.type as InteractionType,
        subject: orm.subject,
        description: orm.description,
        outcome: orm.outcome,
        scheduledAt: orm.scheduledAt,
        completedAt: orm.completedAt,
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
      },
      orm.id,
    );
    return result.getValue();
  }

  static toOrm(domain: Interaction): InteractionOrmEntity {
    const orm = new InteractionOrmEntity();
    orm.id = domain.id;
    orm.orgId = domain.orgId;
    orm.userId = domain.userId;
    orm.customerId = domain.customerId;
    orm.contactId = domain.contactId;
    orm.opportunityId = domain.opportunityId;
    orm.type = domain.type;
    orm.subject = domain.subject;
    orm.description = domain.description;
    orm.outcome = domain.outcome;
    orm.scheduledAt = domain.scheduledAt;
    orm.completedAt = domain.completedAt;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
