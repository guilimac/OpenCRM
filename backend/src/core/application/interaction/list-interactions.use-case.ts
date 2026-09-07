import { Inject, Injectable } from '@nestjs/common';
import {
  INTERACTION_REPOSITORY_PORT,
  type IInteractionRepository,
} from '../../domain/interaction/interaction.repository.port.js';
import { Interaction } from '../../domain/interaction/interaction.entity.js';
import { Result } from '../../domain/common/result.js';

@Injectable()
export class ListInteractionsUseCase {
  constructor(
    @Inject(INTERACTION_REPOSITORY_PORT)
    private readonly interactionRepository: IInteractionRepository,
  ) {}

  async execute(orgId: string): Promise<Result<Interaction[]>> {
    if (!orgId) {
      return Result.fail<Interaction[]>('Organization ID is required');
    }

    const interactions = await this.interactionRepository.findAllInOrg(orgId);
    return Result.ok<Interaction[]>(interactions);
  }
}
