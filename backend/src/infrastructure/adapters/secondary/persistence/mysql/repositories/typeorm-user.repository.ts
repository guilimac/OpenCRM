import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type IUserRepository } from '../../../../../../core/domain/user/user.repository.port.js';
import { User } from '../../../../../../core/domain/user/user.entity.js';
import { UserOrmEntity } from '../entities/user.orm-entity.js';
import { UserMapper } from '../mappers/user.mapper.js';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async findByEmail(orgId: string, email: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { orgId, email } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async findByEmailGlobal(email: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { email } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async save(user: User): Promise<void> {
    const orm = UserMapper.toOrm(user);
    await this.repo.save(orm);
  }

  async update(user: User): Promise<void> {
    const orm = UserMapper.toOrm(user);
    await this.repo.save(orm);
  }
}
