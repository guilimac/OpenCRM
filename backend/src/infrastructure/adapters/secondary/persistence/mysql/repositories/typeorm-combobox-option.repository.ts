import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  type IComboboxOptionRepository,
} from '../../../../../../core/domain/settings/combobox-option.repository.port.js';
import { ComboboxOption } from '../../../../../../core/domain/settings/entities/combobox-option.entity.js';
import { ComboboxCategory } from '../../../../../../core/domain/settings/value-objects/combobox-category.vo.js';
import { ComboboxOptionOrmEntity } from '../entities/combobox-option.orm-entity.js';
import { ComboboxOptionMapper } from '../mappers/combobox-option.mapper.js';

@Injectable()
export class TypeOrmComboboxOptionRepository implements IComboboxOptionRepository {
  constructor(
    @InjectRepository(ComboboxOptionOrmEntity)
    private readonly repo: Repository<ComboboxOptionOrmEntity>,
  ) {}

  async findAllByOrg(orgId: string): Promise<ComboboxOption[]> {
    const orms = await this.repo.find({
      where: { orgId },
      order: {
        category: 'ASC',
        orderIndex: 'ASC',
        label: 'ASC',
      },
    });
    return orms.map((orm) => ComboboxOptionMapper.toDomain(orm));
  }

  async findByCategory(orgId: string, category: ComboboxCategory): Promise<ComboboxOption[]> {
    const orms = await this.repo.find({
      where: { orgId, category },
      order: {
        orderIndex: 'ASC',
        label: 'ASC',
      },
    });
    return orms.map((orm) => ComboboxOptionMapper.toDomain(orm));
  }

  async findById(orgId: string, id: string): Promise<ComboboxOption | null> {
    const orm = await this.repo.findOne({
      where: { orgId, id },
    });
    return orm ? ComboboxOptionMapper.toDomain(orm) : null;
  }

  async findByValue(
    orgId: string,
    category: ComboboxCategory,
    value: string,
  ): Promise<ComboboxOption | null> {
    const orm = await this.repo.findOne({
      where: { orgId, category, value },
    });
    return orm ? ComboboxOptionMapper.toDomain(orm) : null;
  }

  async save(option: ComboboxOption): Promise<void> {
    const orm = ComboboxOptionMapper.toOrm(option);
    await this.repo.save(orm);
  }

  async saveMany(options: ComboboxOption[]): Promise<void> {
    if (!options || options.length === 0) return;
    const orms = options.map((opt) => ComboboxOptionMapper.toOrm(opt));
    await this.repo.save(orms);
  }

  async delete(orgId: string, id: string): Promise<void> {
    await this.repo.delete({ orgId, id });
  }

  async deleteByCategory(orgId: string, category: ComboboxCategory): Promise<void> {
    await this.repo.delete({ orgId, category });
  }

  async countByCategory(orgId: string, category: ComboboxCategory): Promise<number> {
    return this.repo.count({
      where: { orgId, category },
    });
  }
}
