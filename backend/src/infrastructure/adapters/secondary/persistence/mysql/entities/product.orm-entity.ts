import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('products')
@Index('idx_product_org_code', ['orgId', 'code'])
@Index('idx_product_org_cat_active', ['orgId', 'category', 'isActive'])
export class ProductOrmEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string;

  @Column('char', { length: 36, name: 'org_id' })
  orgId!: string;

  @Column('varchar', { length: 100 })
  code!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('text', { nullable: true })
  description?: string | null;

  @Column('varchar', { length: 100, default: 'PRODUTO' })
  category!: string;

  @Column('decimal', { precision: 15, scale: 2, name: 'unit_price', default: 0.0 })
  unitPrice!: number;

  @Column('varchar', { length: 50, default: 'un' })
  unit!: string;

  @Column('char', { length: 3, default: 'BRL' })
  currency!: string;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
