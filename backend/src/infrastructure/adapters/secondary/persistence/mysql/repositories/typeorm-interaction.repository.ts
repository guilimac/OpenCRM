import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  type IInteractionRepository,
} from '../../../../../../core/domain/interaction/interaction.repository.port.js';
import { Interaction } from '../../../../../../core/domain/interaction/interaction.entity.js';
import { InteractionOrmEntity } from '../entities/interaction.orm-entity.js';
import { InteractionMapper } from '../mappers/interaction.mapper.js';

@Injectable()
export class TypeOrmInteractionRepository implements IInteractionRepository {
  constructor(
    @InjectRepository(InteractionOrmEntity)
    private readonly repo: Repository<InteractionOrmEntity>,
  ) {}

  async findById(orgId: string, id: string): Promise<Interaction | null> {
    const orm = await this.repo.findOne({ where: { orgId, id } });
    return orm ? InteractionMapper.toDomain(orm) : null;
  }

  async findByCustomer(orgId: string, customerId: string): Promise<Interaction[]> {
    const orms = await this.repo.find({
      where: { orgId, customerId },
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => InteractionMapper.toDomain(orm));
  }

  async findByUser(orgId: string, userId: string): Promise<Interaction[]> {
    const orms = await this.repo.find({
      where: { orgId, userId },
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => InteractionMapper.toDomain(orm));
  }

  async save(interaction: Interaction): Promise<void> {
    const orm = InteractionMapper.toOrm(interaction);
    await this.repo.save(orm);
  }

  async update(interaction: Interaction): Promise<void> {
    const orm = InteractionMapper.toOrm(interaction);
    await this.repo.save(orm);
  }

  async delete(orgId: string, id: string): Promise<void> {
    await this.repo.delete({ orgId, id });
  }
}
