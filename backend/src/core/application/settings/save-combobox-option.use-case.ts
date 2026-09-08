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
import { Result } from '../../domain/common/result.js';

export interface SaveComboboxOptionCommand {
  orgId: string;
  id?: string;
  category: ComboboxCategory;
  value: string;
  label: string;
  orderIndex?: number;
  isActive?: boolean;
}

@Injectable()
export class SaveComboboxOptionUseCase {
  constructor(
    @Inject(COMBOBOX_OPTION_REPOSITORY_PORT)
    private readonly repository: IComboboxOptionRepository,
  ) {}

  async execute(command: SaveComboboxOptionCommand): Promise<Result<ComboboxOption>> {
    if (!command.orgId || command.orgId.trim().length === 0) {
      return Result.fail<ComboboxOption>('Organization ID is required');
    }

    if (!isValidComboboxCategory(command.category)) {
      return Result.fail<ComboboxOption>(`Invalid combobox category: ${command.category}`);
    }

    if (command.id) {
      const existing = await this.repository.findById(command.orgId, command.id);
      if (!existing) {
        return Result.fail<ComboboxOption>('Combobox option not found');
      }

      const updateResult = existing.update({
        label: command.label,
        orderIndex: command.orderIndex,
        isActive: command.isActive,
      });

      if (updateResult.isFailure) {
        return Result.fail<ComboboxOption>(updateResult.error || 'Failed to update option');
      }

      await this.repository.save(existing);
      return Result.ok<ComboboxOption>(existing);
    }

    // Creating a new option
    if (!command.value || command.value.trim().length === 0) {
      return Result.fail<ComboboxOption>('Option value is required');
    }

    const trimmedValue = command.value.trim();
    const duplicate = await this.repository.findByValue(command.orgId, command.category, trimmedValue);
    if (duplicate) {
      return Result.fail<ComboboxOption>(
        `An option with value "${trimmedValue}" already exists in this category`,
      );
    }

    let orderIndex = command.orderIndex;
    if (orderIndex === undefined || orderIndex === null) {
      orderIndex = await this.repository.countByCategory(command.orgId, command.category);
    }

    const optionResult = ComboboxOption.create(
      {
        orgId: command.orgId,
        category: command.category,
        value: trimmedValue,
        label: command.label ? command.label.trim() : trimmedValue,
        orderIndex,
        isDefault: false,
        isActive: command.isActive !== undefined ? command.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      uuidv4(),
    );

    if (optionResult.isFailure) {
      return Result.fail<ComboboxOption>(optionResult.error || 'Failed to create option');
    }

    const option = optionResult.getValue();
    await this.repository.save(option);
    return Result.ok<ComboboxOption>(option);
  }
}
