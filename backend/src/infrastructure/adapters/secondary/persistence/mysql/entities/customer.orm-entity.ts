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
import type { ContactOrmEntity } from './contact.orm-entity.js';

@Entity('customers')
@Index('idx_cust_org_status', ['orgId', 'status', 'createdAt'])
@Index('idx_cust_owner', ['orgId', 'assignedOwnerId'])
export class CustomerOrmEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string;

  @Column('char', { length: 36, name: 'org_id' })
  orgId!: string;

  @Column('char', { length: 36, name: 'assigned_owner_id', nullable: true })
  assignedOwnerId?: string | null;

  @Column('varchar', { length: 200, name: 'company_name' })
  companyName!: string;

  @Column('varchar', { length: 100, nullable: true })
  industry?: string | null;

  @Column('varchar', { length: 255, nullable: true })
  website?: string | null;

  @Column({
    type: 'enum',
    enum: ['LEAD', 'PROSPECT', 'ACTIVE_CUSTOMER', 'CHURNED', 'INACTIVE'],
    default: 'LEAD',
  })
  status!: string;

  @Column('decimal', { precision: 15, scale: 2, name: 'annual_revenue', nullable: true })
  annualRevenue?: number | null;

  @Column('int', { unsigned: true, name: 'employee_count', nullable: true })
  employeeCount?: number | null;

  @OneToMany('ContactOrmEntity', (contact: ContactOrmEntity) => contact.customer, { cascade: true })
  contacts?: Relation<ContactOrmEntity>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
