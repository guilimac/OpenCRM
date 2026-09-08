import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('combobox_options')
@Index('idx_combobox_org_cat_order', ['orgId', 'category', 'orderIndex'])
@Index('idx_combobox_org_cat_val', ['orgId', 'category', 'value'])
export class ComboboxOptionOrmEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string;

  @Column('char', { length: 36, name: 'org_id' })
  orgId!: string;

  @Column('varchar', { length: 64 })
  category!: string;

  @Column('varchar', { length: 128 })
  value!: string;

  @Column('varchar', { length: 255 })
  label!: string;

  @Column('int', { name: 'order_index', default: 0 })
  orderIndex!: number;

  @Column('boolean', { name: 'is_default', default: false })
  isDefault!: boolean;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
