import { Budget } from '../../../../../../core/domain/budget/entities/budget.entity.js';
import { BudgetItem } from '../../../../../../core/domain/budget/entities/budget-item.entity.js';
import { BudgetStatus } from '../../../../../../core/domain/budget/value-objects/budget-status.vo.js';
import { BudgetOrmEntity } from '../entities/budget.orm-entity.js';
import { BudgetItemOrmEntity } from '../entities/budget-item.orm-entity.js';

export class BudgetMapper {
  static toDomain(orm: BudgetOrmEntity): Budget {
    const items = (orm.items || []).map((itemOrm) => {
      const itemRes = BudgetItem.create(
        {
          budgetId: itemOrm.budgetId,
          productId: itemOrm.productId,
          description: itemOrm.description,
          quantity: Number(itemOrm.quantity),
          unitPrice: Number(itemOrm.unitPrice),
          discountPercent: Number(itemOrm.discountPercent),
          total: Number(itemOrm.total),
        },
        itemOrm.id,
      );
      if (itemRes.isFailure) {
        throw new Error(`Failed to map BudgetItemOrmEntity to domain: ${itemRes.error}`);
      }
      return itemRes.getValue();
    });

    const statusRes = BudgetStatus.create(orm.status);
    if (statusRes.isFailure) {
      throw new Error(`Invalid status in BudgetOrmEntity: ${orm.status}`);
    }

    const budgetRes = Budget.create(
      {
        orgId: orm.orgId,
        budgetNumber: orm.budgetNumber,
        title: orm.title,
        customerId: orm.customerId,
        opportunityId: orm.opportunityId,
        status: statusRes.getValue(),
        issueDate: orm.issueDate,
        validUntil: orm.validUntil,
        items,
        subtotal: Number(orm.subtotal),
        discountAmount: Number(orm.discountAmount),
        totalAmount: Number(orm.totalAmount),
        currency: orm.currency,
        paymentTerms: orm.paymentTerms,
        notes: orm.notes,
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
      },
      orm.id,
    );

    if (budgetRes.isFailure) {
      throw new Error(`Failed to map BudgetOrmEntity to domain: ${budgetRes.error}`);
    }

    return budgetRes.getValue();
  }

  static toOrm(domain: Budget): BudgetOrmEntity {
    const orm = new BudgetOrmEntity();
    orm.id = domain.id;
    orm.orgId = domain.orgId;
    orm.budgetNumber = domain.budgetNumber;
    orm.title = domain.title;
    orm.customerId = domain.customerId;
    orm.opportunityId = domain.opportunityId || null;
    orm.status = domain.status.value;
    orm.issueDate = domain.issueDate;
    orm.validUntil = domain.validUntil;
    orm.subtotal = domain.subtotal;
    orm.discountAmount = domain.discountAmount;
    orm.totalAmount = domain.totalAmount;
    orm.currency = domain.currency;
    orm.paymentTerms = domain.paymentTerms || null;
    orm.notes = domain.notes || null;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;

    orm.items = domain.items.map((item) => {
      const itemOrm = new BudgetItemOrmEntity();
      itemOrm.id = item.id;
      itemOrm.budgetId = domain.id;
      itemOrm.productId = item.productId || null;
      itemOrm.description = item.description;
      itemOrm.quantity = item.quantity;
      itemOrm.unitPrice = item.unitPrice;
      itemOrm.discountPercent = item.discountPercent;
      itemOrm.total = item.total;
      return itemOrm;
    });

    return orm;
  }
}
