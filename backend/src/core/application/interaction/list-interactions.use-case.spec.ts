import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListInteractionsUseCase } from './list-interactions.use-case.js';
import { Interaction } from '../../domain/interaction/interaction.entity.js';

describe('ListInteractionsUseCase', () => {
  let useCase: ListInteractionsUseCase;
  let interactionRepo: any;

  const mockInteraction = Interaction.create(
    {
      orgId: 'org-1',
      userId: 'user-1',
      customerId: 'cust-1',
      type: 'EMAIL',
      subject: 'Follow-up on proposal',
      description: 'Sent detailed pricing sheet',
      outcome: 'REPLIED',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'inter-1',
  ).getValue();

  beforeEach(() => {
    interactionRepo = {
      findAllInOrg: vi.fn().mockResolvedValue([mockInteraction]),
    };

    useCase = new ListInteractionsUseCase(interactionRepo);
  });

  it('should successfully return all interactions for an organization', async () => {
    const result = await useCase.execute('org-1');

    expect(result.isSuccess).toBe(true);
    const interactions = result.getValue();
    expect(interactions).toHaveLength(1);
    expect(interactions[0].id).toBe('inter-1');
    expect(interactions[0].type).toBe('EMAIL');
    expect(interactionRepo.findAllInOrg).toHaveBeenCalledWith('org-1');
  });

  it('should return error if orgId is missing', async () => {
    const result = await useCase.execute('');

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Organization ID is required');
    expect(interactionRepo.findAllInOrg).not.toHaveBeenCalled();
  });
});
