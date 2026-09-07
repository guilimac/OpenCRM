export type BudgetStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface BudgetItemDetail {
  id: string;
  productId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  total: number;
}

export interface BudgetDetail {
  id: string;
  budgetNumber: string;
  title: string;
  customerId: string;
  customerName?: string;
  opportunityId?: string | null;
  status: BudgetStatus;
  issueDate: string;
  validUntil: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentTerms?: string | null;
  notes?: string | null;
  items: BudgetItemDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetItemPayload {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
}

export interface CreateBudgetPayload {
  title: string;
  customerId: string;
  opportunityId?: string;
  issueDate?: string;
  validUntil?: string;
  items: CreateBudgetItemPayload[];
  discountAmount?: number;
  currency?: string;
  paymentTerms?: string;
  notes?: string;
}
