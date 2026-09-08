import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  COMBOBOX_OPTION_REPOSITORY_PORT,
  type IComboboxOptionRepository,
} from '../../domain/settings/combobox-option.repository.port.js';
import { ComboboxOption } from '../../domain/settings/entities/combobox-option.entity.js';
import {
  ComboboxCategory,
  ALL_COMBOBOX_CATEGORIES,
} from '../../domain/settings/value-objects/combobox-category.vo.js';
import { DEFAULT_COMBOBOX_OPTIONS } from '../../domain/settings/combobox-defaults.js';
import { Result } from '../../domain/common/result.js';

export interface GetComboboxOptionsQuery {
  orgId: string;
  category?: ComboboxCategory;
}

@Injectable()
export class GetComboboxOptionsUseCase {
  constructor(
    @Inject(COMBOBOX_OPTION_REPOSITORY_PORT)
    private readonly repository: IComboboxOptionRepository,
  ) {}

  async execute(query: GetComboboxOptionsQuery): Promise<Result<ComboboxOption[]>> {
    if (!query.orgId || query.orgId.trim().length === 0) {
      return Result.fail<ComboboxOption[]>('Organization ID is required');
    }

    const categoriesToCheck = query.category ? [query.category] : ALL_COMBOBOX_CATEGORIES;

    for (const cat of categoriesToCheck) {
      const count = await this.repository.countByCategory(query.orgId, cat);
      if (count === 0) {
        const defaults = DEFAULT_COMBOBOX_OPTIONS[cat] || [];
        const toSeed: ComboboxOption[] = [];
        for (const item of defaults) {
          const optResult = ComboboxOption.create(
            {
              orgId: query.orgId,
              category: cat,
              value: item.value,
              label: item.label,
              orderIndex: item.orderIndex,
              isDefault: true,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            uuidv4(),
          );
          if (optResult.isSuccess) {
            toSeed.push(optResult.getValue());
          }
        }
        if (toSeed.length > 0) {
          await this.repository.saveMany(toSeed);
        }
      }
    }

    if (query.category) {
      const options = await this.repository.findByCategory(query.orgId, query.category);
      return Result.ok<ComboboxOption[]>(options);
    }

    const allOptions = await this.repository.findAllByOrg(query.orgId);
    return Result.ok<ComboboxOption[]>(allOptions);
  }
}
