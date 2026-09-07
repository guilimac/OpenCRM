export type InteractionType = 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK';

export interface InteractionItem {
  id: string;
  userId: string;
  customerId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  type: InteractionType;
  subject: string;
  description?: string | null;
  outcome?: string | null;
  scheduledAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
