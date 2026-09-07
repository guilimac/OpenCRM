import { AggregateRoot } from '../../common/aggregate-root.base.js';
import { Result } from '../../common/result.js';
import { BudgetStatus } from '../value-objects/budget-status.vo.js';
import { BudgetItem } from './budget-item.entity.js';

export interface BudgetProps {
  orgId: string;
  budgetNumber: string;
  title: string;
  customerId: string;
  opportunityId?: string | null;
  status: BudgetStatus;
  issueDate: Date;
  validUntil: Date;
  items: BudgetItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentTerms?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Budget extends AggregateRoot<BudgetProps> {
  get orgId(): string {
    return this.props.orgId;
  }

  get budgetNumber(): string {
    return this.props.budgetNumber;
  }

  get title(): string {
    return this.props.title;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get opportunityId(): string | null | undefined {
    return this.props.opportunityId;
  }

  get status(): BudgetStatus {
    return this.props.status;
  }

  get issueDate(): Date {
    return this.props.issueDate;
  }

  get validUntil(): Date {
    return this.props.validUntil;
  }

  get items(): BudgetItem[] {
    return [...this.props.items];
  }

  get subtotal(): number {
    return this.props.subtotal;
  }

  get discountAmount(): number {
    return this.props.discountAmount;
  }

  get totalAmount(): number {
    return this.props.totalAmount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get paymentTerms(): string | null | undefined {
    return this.props.paymentTerms;
  }

  get notes(): string | null | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public changeStatus(newStatus: BudgetStatus): Result<void> {
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public updateDetails(params: {
    title?: string;
    validUntil?: Date;
    paymentTerms?: string | null;
    notes?: string | null;
    discountAmount?: number;
  }): void {
    if (params.title !== undefined) this.props.title = params.title.trim();
    if (params.validUntil !== undefined) this.props.validUntil = params.validUntil;
    if (params.paymentTerms !== undefined) this.props.paymentTerms = params.paymentTerms;
    if (params.notes !== undefined) this.props.notes = params.notes;
    if (params.discountAmount !== undefined) {
      this.props.discountAmount = Math.max(0, params.discountAmount);
    }
    this.recalculateTotals();
    this.props.updatedAt = new Date();
  }

  public updateItems(items: BudgetItem[]): Result<void> {
    if (!items || items.length === 0) {
      return Result.fail<void>('Budget must contain at least one item');
    }
    this.props.items = items;
    this.recalculateTotals();
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  private recalculateTotals(): void {
    const rawSubtotal = this.props.items.reduce((sum, item) => sum + item.total, 0);
    this.props.subtotal = Math.round(rawSubtotal * 100) / 100;
    const netTotal = Math.max(0, this.props.subtotal - (this.props.discountAmount || 0));
    this.props.totalAmount = Math.round(netTotal * 100) / 100;
  }

  public static create(
    props: Omit<BudgetProps, 'subtotal' | 'totalAmount'> & {
      subtotal?: number;
      totalAmount?: number;
    },
    id: string,
  ): Result<Budget> {
    if (!props.orgId) {
      return Result.fail<Budget>('Organization ID is required');
    }
    if (!props.customerId) {
      return Result.fail<Budget>('Customer ID is required');
    }
    if (!props.title || props.title.trim().length === 0) {
      return Result.fail<Budget>('Budget title is required');
    }
    if (!props.items || props.items.length === 0) {
      return Result.fail<Budget>('Budget must contain at least one item');
    }

    const rawSubtotal = props.items.reduce((sum, item) => sum + item.total, 0);
    const subtotal = Math.round(rawSubtotal * 100) / 100;
    const discountAmount = props.discountAmount ? Math.max(0, props.discountAmount) : 0;
    const netTotal = Math.max(0, subtotal - discountAmount);
    const totalAmount = Math.round(netTotal * 100) / 100;

    return Result.ok<Budget>(
      new Budget(
        {
          ...props,
          subtotal,
          discountAmount,
          totalAmount,
          currency: props.currency ? props.currency.toUpperCase().trim() : 'BRL',
          createdAt: props.createdAt || new Date(),
          updatedAt: props.updatedAt || new Date(),
        },
        id,
      ),
    );
  }
}
