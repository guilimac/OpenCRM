import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  type IBudgetRepository,
  type BudgetFilterOptions,
} from '../../../../../../core/domain/budget/budget.repository.port.js';
import { Budget } from '../../../../../../core/domain/budget/entities/budget.entity.js';
import { BudgetOrmEntity } from '../entities/budget.orm-entity.js';
import { BudgetItemOrmEntity } from '../entities/budget-item.orm-entity.js';
import { BudgetMapper } from '../mappers/budget.mapper.js';

@Injectable()
export class TypeOrmBudgetRepository implements IBudgetRepository {
  constructor(
    @InjectRepository(BudgetOrmEntity)
    private readonly budgetRepo: Repository<BudgetOrmEntity>,
    @InjectRepository(BudgetItemOrmEntity)
    private readonly itemRepo: Repository<BudgetItemOrmEntity>,
  ) {}

  async findById(orgId: string, id: string): Promise<Budget | null> {
    const orm = await this.budgetRepo.findOne({
      where: { orgId, id },
      relations: { items: true },
    });
    return orm ? BudgetMapper.toDomain(orm) : null;
  }

  async findByNumber(orgId: string, budgetNumber: string): Promise<Budget | null> {
    const orm = await this.budgetRepo.findOne({
      where: { orgId, budgetNumber },
      relations: { items: true },
    });
    return orm ? BudgetMapper.toDomain(orm) : null;
  }

  async findAllInOrg(orgId: string, options?: BudgetFilterOptions): Promise<Budget[]> {
    const qb = this.budgetRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.items', 'items')
      .where('b.orgId = :orgId', { orgId });

    if (options?.customerId) {
      qb.andWhere('b.customerId = :customerId', { customerId: options.customerId });
    }

    if (options?.opportunityId) {
      qb.andWhere('b.opportunityId = :opportunityId', { opportunityId: options.opportunityId });
    }

    if (options?.status) {
      qb.andWhere('b.status = :status', { status: options.status });
    }

    if (options?.search) {
      const s = `%${options.search}%`;
      qb.andWhere('(b.title LIKE :search OR b.budgetNumber LIKE :search)', { search: s });
    }

    qb.orderBy('b.createdAt', 'DESC');

    const orms = await qb.getMany();
    return orms.map((orm) => BudgetMapper.toDomain(orm));
  }

  async findByCustomer(orgId: string, customerId: string): Promise<Budget[]> {
    const orms = await this.budgetRepo.find({
      where: { orgId, customerId },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => BudgetMapper.toDomain(orm));
  }

  async generateNextNumber(orgId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.budgetRepo
      .createQueryBuilder('b')
      .where('b.orgId = :orgId', { orgId })
      .andWhere('b.budgetNumber LIKE :pattern', { pattern: `ORC-${year}-%` })
      .getCount();

    const sequence = String(count + 1).padStart(4, '0');
    return `ORC-${year}-${sequence}`;
  }

  async save(budget: Budget): Promise<void> {
    const orm = BudgetMapper.toOrm(budget);
    await this.budgetRepo.save(orm);
  }

  async update(budget: Budget): Promise<void> {
    const orm = BudgetMapper.toOrm(budget);
    // Delete existing items to replace with updated items
    await this.itemRepo.delete({ budgetId: budget.id });
    await this.budgetRepo.save(orm);
  }

  async delete(orgId: string, id: string): Promise<void> {
    await this.itemRepo.delete({ budgetId: id });
    await this.budgetRepo.delete({ orgId, id });
  }
}
