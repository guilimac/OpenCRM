import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index('idx_users_org_role', ['orgId', 'role', 'isActive'])
export class UserOrmEntity {
  @PrimaryColumn('char', { length: 36 })
  id!: string;

  @Column('char', { length: 36, name: 'org_id' })
  orgId!: string;

  @Column('varchar', { length: 255 })
  email!: string;

  @Column('varchar', { length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column('varchar', { length: 100, name: 'first_name' })
  firstName!: string;

  @Column('varchar', { length: 100, name: 'last_name' })
  lastName!: string;

  @Column({
    type: 'enum',
    enum: ['SUPERADMIN', 'ADMIN', 'MANAGER', 'SALES_REP', 'SUPPORT_AGENT'],
    default: 'SALES_REP',
  })
  role!: string;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @Column('timestamp', { name: 'last_login_at', nullable: true })
  lastLoginAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
