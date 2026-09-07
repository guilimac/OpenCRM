import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  type Relation,
} from 'typeorm';
import type { CustomerListMemberOrmEntity } from './customer-list-member.orm-entity.js';

@Entity('customer_lists')
@Index('idx_cust_list_org', ['orgId', 'createdAt'])
export class CustomerListOrmEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string;

  @Column('char', { length: 36, name: 'org_id' })
  orgId!: string;

  @Column('varchar', { length: 150 })
  name!: string;

  @Column('text', { nullable: true })
  description?: string | null;

  @OneToMany('CustomerListMemberOrmEntity', (m: CustomerListMemberOrmEntity) => m.list, {
    cascade: true,
  })
  members?: Relation<CustomerListMemberOrmEntity>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
