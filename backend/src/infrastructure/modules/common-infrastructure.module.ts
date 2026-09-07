import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CACHE_PORT } from '../../core/application/common/ports/cache.port.js';
import { USER_REPOSITORY_PORT } from '../../core/domain/user/user.repository.port.js';
import { RedisCacheAdapter } from '../adapters/secondary/cache/redis/redis-cache.adapter.js';
import { UserOrmEntity } from '../adapters/secondary/persistence/mysql/entities/user.orm-entity.js';
import { TypeOrmUserRepository } from '../adapters/secondary/persistence/mysql/repositories/typeorm-user.repository.js';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [
    {
      provide: CACHE_PORT,
      useClass: RedisCacheAdapter,
    },
    {
      provide: USER_REPOSITORY_PORT,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [CACHE_PORT, USER_REPOSITORY_PORT, TypeOrmModule],
})
export class CommonInfrastructureModule {}
