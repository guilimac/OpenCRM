import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
  type Relation,
} from 'typeorm';
import type { BudgetItemOrmEntity } from './budget-item.orm-entity.js';

@Entity('budgets')
@Index('idx_budget_org_number', ['orgId', 'budgetNumber'])
@Index('idx_budget_org_customer', ['orgId', 'customerId'])
@Index('idx_budget_org_status', ['orgId', 'status'])
export class BudgetOrmEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string;

  @Column('char', { length: 36, name: 'org_id' })
  orgId!: string;

  @Column('varchar', { length: 50, name: 'budget_number' })
  budgetNumber!: string;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column('char', { length: 36, name: 'customer_id' })
  customerId!: string;

  @Column('char', { length: 36, name: 'opportunity_id', nullable: true })
  opportunityId?: string | null;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'],
    default: 'DRAFT',
  })
  status!: string;

  @Column('date', { name: 'issue_date' })
  issueDate!: Date;

  @Column('date', { name: 'valid_until' })
  validUntil!: Date;

  @Column('decimal', { precision: 15, scale: 2, default: 0.0 })
  subtotal!: number;

  @Column('decimal', { precision: 15, scale: 2, name: 'discount_amount', default: 0.0 })
  discountAmount!: number;

  @Column('decimal', { precision: 15, scale: 2, name: 'total_amount', default: 0.0 })
  totalAmount!: number;

  @Column('char', { length: 3, default: 'BRL' })
  currency!: string;

  @Column('varchar', { length: 255, name: 'payment_terms', nullable: true })
  paymentTerms?: string | null;

  @Column('text', { nullable: true })
  notes?: string | null;

  @OneToMany('BudgetItemOrmEntity', (item: BudgetItemOrmEntity) => item.budget, {
    cascade: true,
    eager: false,
  })
  items!: Relation<BudgetItemOrmEntity>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
