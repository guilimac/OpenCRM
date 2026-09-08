import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type IEmailConfigRepository } from '../../../../../../core/domain/settings/email-config.repository.port.js';
import { EmailConfig } from '../../../../../../core/domain/settings/entities/email-config.entity.js';
import { EmailConfigOrmEntity } from '../entities/email-config.orm-entity.js';
import { EmailConfigMapper } from '../mappers/email-config.mapper.js';

@Injectable()
export class TypeOrmEmailConfigRepository implements IEmailConfigRepository {
  constructor(
    @InjectRepository(EmailConfigOrmEntity)
    private readonly repo: Repository<EmailConfigOrmEntity>,
  ) {}

  async findByOrgId(orgId: string): Promise<EmailConfig | null> {
    const orm = await this.repo.findOne({ where: { orgId } });
    return orm ? EmailConfigMapper.toDomain(orm) : null;
  }

  async save(config: EmailConfig): Promise<void> {
    const orm = EmailConfigMapper.toOrm(config);
    await this.repo.save(orm);
  }
}
