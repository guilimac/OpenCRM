import { CustomerList } from '../../../../../../core/domain/customer-list/customer-list.entity.js';
import { CustomerListOrmEntity } from '../entities/customer-list.orm-entity.js';
import { CustomerListMemberOrmEntity } from '../entities/customer-list-member.orm-entity.js';

export class CustomerListMapper {
  static toDomain(orm: CustomerListOrmEntity): CustomerList {
    const customerIds = (orm.members ?? []).map((m) => m.customerId);
    const result = CustomerList.create(
      {
        orgId: orm.orgId,
        name: orm.name,
        description: orm.description,
        customerIds,
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
      },
      orm.id,
    );
    return result.getValue();
  }

  static toOrm(domain: CustomerList): CustomerListOrmEntity {
    const orm = new CustomerListOrmEntity();
    orm.id = domain.id;
    orm.orgId = domain.orgId;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;

    if (domain.customerIds && domain.customerIds.length > 0) {
      orm.members = domain.customerIds.map((cid) => {
        const member = new CustomerListMemberOrmEntity();
        member.listId = domain.id;
        member.customerId = cid;
        member.createdAt = new Date();
        return member;
      });
    } else {
      orm.members = [];
    }

    return orm;
  }
}
