import { Interaction } from './interaction.entity.js';

export const INTERACTION_REPOSITORY_PORT = Symbol('INTERACTION_REPOSITORY_PORT');

export interface IInteractionRepository {
  findById(orgId: string, id: string): Promise<Interaction | null>;
  findByCustomer(orgId: string, customerId: string): Promise<Interaction[]>;
  findByUser(orgId: string, userId: string): Promise<Interaction[]>;
  save(interaction: Interaction): Promise<void>;
  update(interaction: Interaction): Promise<void>;
  delete(orgId: string, id: string): Promise<void>;
}
