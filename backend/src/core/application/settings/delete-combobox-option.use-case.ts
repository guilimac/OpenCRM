import { Inject, Injectable } from '@nestjs/common';
import {
  COMBOBOX_OPTION_REPOSITORY_PORT,
  type IComboboxOptionRepository,
} from '../../domain/settings/combobox-option.repository.port.js';
import { Result } from '../../domain/common/result.js';

export interface DeleteComboboxOptionCommand {
  orgId: string;
  id: string;
}

@Injectable()
export class DeleteComboboxOptionUseCase {
  constructor(
    @Inject(COMBOBOX_OPTION_REPOSITORY_PORT)
    private readonly repository: IComboboxOptionRepository,
  ) {}

  async execute(command: DeleteComboboxOptionCommand): Promise<Result<void>> {
    if (!command.orgId || command.orgId.trim().length === 0) {
      return Result.fail<void>('Organization ID is required');
    }
    if (!command.id || command.id.trim().length === 0) {
      return Result.fail<void>('Option ID is required');
    }

    const existing = await this.repository.findById(command.orgId, command.id);
    if (!existing) {
      return Result.fail<void>('Combobox option not found');
    }

    await this.repository.delete(command.orgId, command.id);
    return Result.ok<void>();
  }
}
