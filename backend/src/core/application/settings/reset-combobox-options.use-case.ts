import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  COMBOBOX_OPTION_REPOSITORY_PORT,
  type IComboboxOptionRepository,
} from '../../domain/settings/combobox-option.repository.port.js';
import { ComboboxOption } from '../../domain/settings/entities/combobox-option.entity.js';
import {
  ComboboxCategory,
  isValidComboboxCategory,
} from '../../domain/settings/value-objects/combobox-category.vo.js';
import { DEFAULT_COMBOBOX_OPTIONS } from '../../domain/settings/combobox-defaults.js';
import { Result } from '../../domain/common/result.js';

export interface ResetComboboxOptionsCommand {
  orgId: string;
  category: ComboboxCategory;
}

@Injectable()
export class ResetComboboxOptionsUseCase {
  constructor(
    @Inject(COMBOBOX_OPTION_REPOSITORY_PORT)
    private readonly repository: IComboboxOptionRepository,
  ) {}

  async execute(command: ResetComboboxOptionsCommand): Promise<Result<ComboboxOption[]>> {
    if (!command.orgId || command.orgId.trim().length === 0) {
      return Result.fail<ComboboxOption[]>('Organization ID is required');
    }

    if (!isValidComboboxCategory(command.category)) {
      return Result.fail<ComboboxOption[]>(`Invalid combobox category: ${command.category}`);
    }

    // Remove existing options for this category
    await this.repository.deleteByCategory(command.orgId, command.category);

    // Re-seed defaults
    const defaults = DEFAULT_COMBOBOX_OPTIONS[command.category] || [];
    const toSeed: ComboboxOption[] = [];

    for (const item of defaults) {
      const optResult = ComboboxOption.create(
        {
          orgId: command.orgId,
          category: command.category,
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

    const reseeded = await this.repository.findByCategory(command.orgId, command.category);
    return Result.ok<ComboboxOption[]>(reseeded);
  }
}
