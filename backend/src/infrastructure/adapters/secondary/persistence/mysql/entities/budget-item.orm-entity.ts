import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import type { BudgetOrmEntity } from './budget.orm-entity.js';

@Entity('budget_items')
export class BudgetItemOrmEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string;

  @Column('char', { length: 36, name: 'budget_id' })
  budgetId!: string;

  @Column('char', { length: 36, name: 'product_id', nullable: true })
  productId?: string | null;

  @Column('varchar', { length: 255 })
  description!: string;

  @Column('decimal', { precision: 10, scale: 2, default: 1.0 })
  quantity!: number;

  @Column('decimal', { precision: 15, scale: 2, name: 'unit_price', default: 0.0 })
  unitPrice!: number;

  @Column('decimal', { precision: 5, scale: 2, name: 'discount_percent', default: 0.0 })
  discountPercent!: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0.0 })
  total!: number;

  @ManyToOne('BudgetOrmEntity', (b: BudgetOrmEntity) => b.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'budget_id' })
  budget?: Relation<BudgetOrmEntity>;
}
