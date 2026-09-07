import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import type { CustomerOrmEntity } from './customer.orm-entity.js';

@Entity('contacts')
@Index('idx_contacts_org_customer', ['orgId', 'customerId'])
@Index('idx_contacts_org_email', ['orgId', 'email'])
export class ContactOrmEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string;

  @Column('char', { length: 36, name: 'org_id' })
  orgId!: string;

  @Column('char', { length: 36, name: 'customer_id' })
  customerId!: string;

  @Column('varchar', { length: 100, name: 'first_name' })
  firstName!: string;

  @Column('varchar', { length: 100, name: 'last_name' })
  lastName!: string;

  @Column('varchar', { length: 100, nullable: true })
  title?: string | null;

  @Column('varchar', { length: 255 })
  email!: string;

  @Column('varchar', { length: 50, nullable: true })
  phone?: string | null;

  @Column('boolean', { name: 'is_primary', default: false })
  isPrimary!: boolean;

  @ManyToOne('CustomerOrmEntity', (c: CustomerOrmEntity) => c.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer?: Relation<CustomerOrmEntity>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
