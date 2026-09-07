import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('opportunities')
@Index('idx_opp_org_stage_date', ['orgId', 'stage', 'expectedCloseDate'])
@Index('idx_opp_customer', ['orgId', 'customerId'])
@Index('idx_opp_owner', ['orgId', 'ownerId', 'stage'])
export class OpportunityOrmEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string;

  @Column('char', { length: 36, name: 'org_id' })
  orgId!: string;

  @Column('char', { length: 36, name: 'customer_id' })
  customerId!: string;

  @Column('char', { length: 36, name: 'owner_id' })
  ownerId!: string;

  @Column('varchar', { length: 200 })
  title!: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0.0 })
  amount!: number;

  @Column('char', { length: 3, default: 'BRL' })
  currency!: string;

  @Column('decimal', {
    precision: 12,
    scale: 6,
    name: 'exchange_rate_to_brl',
    default: 1.0,
  })
  exchangeRateToBrl!: number;

  @Column({
    type: 'enum',
    enum: ['DISCOVERY', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'],
    default: 'DISCOVERY',
  })
  stage!: string;

  @Column('tinyint', { unsigned: true, default: 10 })
  probability!: number;

  @Column('date', { name: 'expected_close_date' })
  expectedCloseDate!: Date;

  @Column('timestamp', { name: 'closed_at', nullable: true })
  closedAt?: Date | null;

  @Column('varchar', { length: 255, name: 'loss_reason', nullable: true })
  lossReason?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
