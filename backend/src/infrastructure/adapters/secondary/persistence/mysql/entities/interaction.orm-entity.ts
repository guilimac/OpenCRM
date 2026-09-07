import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('interactions')
@Index('idx_inter_timeline', ['orgId', 'customerId', 'createdAt'])
@Index('idx_inter_user_schedule', ['orgId', 'userId', 'scheduledAt'])
export class InteractionOrmEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string;

  @Column('char', { length: 36, name: 'org_id' })
  orgId!: string;

  @Column('char', { length: 36, name: 'user_id' })
  userId!: string;

  @Column('char', { length: 36, name: 'customer_id' })
  customerId!: string;

  @Column('char', { length: 36, name: 'contact_id', nullable: true })
  contactId?: string | null;

  @Column('char', { length: 36, name: 'opportunity_id', nullable: true })
  opportunityId?: string | null;

  @Column({
    type: 'enum',
    enum: ['NOTE', 'CALL', 'EMAIL', 'MEETING', 'TASK'],
  })
  type!: string;

  @Column('varchar', { length: 255 })
  subject!: string;

  @Column('text', { nullable: true })
  description?: string | null;

  @Column('varchar', { length: 100, nullable: true })
  outcome?: string | null;

  @Column('timestamp', { name: 'scheduled_at', nullable: true })
  scheduledAt?: Date | null;

  @Column('timestamp', { name: 'completed_at', nullable: true })
  completedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
