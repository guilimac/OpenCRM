import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import type { CustomerListOrmEntity } from './customer-list.orm-entity.js';
import type { CustomerOrmEntity } from './customer.orm-entity.js';

@Entity('customer_list_members')
@Index('idx_clm_customer', ['customerId'])
export class CustomerListMemberOrmEntity {
  @PrimaryColumn('char', { length: 36, name: 'list_id' })
  listId!: string;

  @PrimaryColumn('char', { length: 36, name: 'customer_id' })
  customerId!: string;

  @ManyToOne('CustomerListOrmEntity', (list: CustomerListOrmEntity) => list.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'list_id' })
  list?: Relation<CustomerListOrmEntity>;

  @ManyToOne('CustomerOrmEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer?: Relation<CustomerOrmEntity>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
