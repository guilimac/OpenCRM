import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('email_configs')
export class EmailConfigOrmEntity {
  @PrimaryColumn('char', { length: 36, name: 'org_id' })
  orgId!: string;

  @Column({
    type: 'enum',
    enum: ['MAILGUN', 'SMTP'],
    default: 'MAILGUN',
  })
  provider!: string;

  @Column('varchar', { length: 255, name: 'mailgun_api_key', nullable: true })
  mailgunApiKey?: string | null;

  @Column('varchar', { length: 255, name: 'mailgun_domain', nullable: true })
  mailgunDomain?: string | null;

  @Column('varchar', { length: 100, name: 'mailgun_host', default: 'api.mailgun.net', nullable: true })
  mailgunHost?: string | null;

  @Column('varchar', { length: 255, name: 'smtp_host', nullable: true })
  smtpHost?: string | null;

  @Column('int', { name: 'smtp_port', default: 587, nullable: true })
  smtpPort?: number | null;

  @Column('varchar', { length: 255, name: 'smtp_user', nullable: true })
  smtpUser?: string | null;

  @Column('varchar', { length: 255, name: 'smtp_password', nullable: true })
  smtpPassword?: string | null;

  @Column('boolean', { name: 'smtp_secure', default: false })
  smtpSecure!: boolean;

  @Column('varchar', { length: 255, name: 'from_email' })
  fromEmail!: string;

  @Column('varchar', { length: 255, name: 'from_name' })
  fromName!: string;

  @Column('varchar', { length: 255, name: 'reply_to', nullable: true })
  replyTo?: string | null;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
