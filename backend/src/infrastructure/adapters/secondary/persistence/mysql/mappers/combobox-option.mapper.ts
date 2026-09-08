import { ComboboxOption } from '../../../../../../core/domain/settings/entities/combobox-option.entity.js';
import { ComboboxCategory } from '../../../../../../core/domain/settings/value-objects/combobox-category.vo.js';
import { ComboboxOptionOrmEntity } from '../entities/combobox-option.orm-entity.js';

export class ComboboxOptionMapper {
  static toDomain(orm: ComboboxOptionOrmEntity): ComboboxOption {
    const result = ComboboxOption.create(
      {
        orgId: orm.orgId,
        category: orm.category as ComboboxCategory,
        value: orm.value,
        label: orm.label,
        orderIndex: Number(orm.orderIndex),
        isDefault: Boolean(orm.isDefault),
        isActive: Boolean(orm.isActive),
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
      },
      orm.id,
    );

    if (result.isFailure) {
      throw new Error(`Failed to map ComboboxOptionOrmEntity to domain: ${result.error}`);
    }

    return result.getValue();
  }

  static toOrm(domain: ComboboxOption): ComboboxOptionOrmEntity {
    const orm = new ComboboxOptionOrmEntity();
    orm.id = domain.id;
    orm.orgId = domain.orgId;
    orm.category = domain.category;
    orm.value = domain.value;
    orm.label = domain.label;
    orm.orderIndex = domain.orderIndex;
    orm.isDefault = domain.isDefault;
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
