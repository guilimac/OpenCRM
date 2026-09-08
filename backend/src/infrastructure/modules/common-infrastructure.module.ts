import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CACHE_PORT } from '../../core/application/common/ports/cache.port.js';
import { EMAIL_PORT } from '../../core/application/common/ports/email.port.js';
import { USER_REPOSITORY_PORT } from '../../core/domain/user/user.repository.port.js';
import { EMAIL_CONFIG_REPOSITORY_PORT } from '../../core/domain/settings/email-config.repository.port.js';
import { RedisCacheAdapter } from '../adapters/secondary/cache/redis/redis-cache.adapter.js';
import { MailgunEmailAdapter } from '../adapters/secondary/email/mailgun-email.adapter.js';
import { UserOrmEntity } from '../adapters/secondary/persistence/mysql/entities/user.orm-entity.js';
import { EmailConfigOrmEntity } from '../adapters/secondary/persistence/mysql/entities/email-config.orm-entity.js';
import { TypeOrmUserRepository } from '../adapters/secondary/persistence/mysql/repositories/typeorm-user.repository.js';
import { TypeOrmEmailConfigRepository } from '../adapters/secondary/persistence/mysql/repositories/typeorm-email-config.repository.js';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity, EmailConfigOrmEntity])],
  providers: [
    {
      provide: CACHE_PORT,
      useClass: RedisCacheAdapter,
    },
    {
      provide: EMAIL_CONFIG_REPOSITORY_PORT,
      useClass: TypeOrmEmailConfigRepository,
    },
    {
      provide: EMAIL_PORT,
      useClass: MailgunEmailAdapter,
    },
    {
      provide: USER_REPOSITORY_PORT,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [CACHE_PORT, EMAIL_PORT, USER_REPOSITORY_PORT, EMAIL_CONFIG_REPOSITORY_PORT, TypeOrmModule],
})
export class CommonInfrastructureModule {}
