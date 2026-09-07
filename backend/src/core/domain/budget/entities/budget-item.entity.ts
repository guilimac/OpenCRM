import { Entity } from '../../common/entity.base.js';
import { Result } from '../../common/result.js';

export interface BudgetItemProps {
  budgetId: string;
  productId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  total: number;
}

export class BudgetItem extends Entity<BudgetItemProps> {
  get budgetId(): string {
    return this.props.budgetId;
  }

  get productId(): string | null | undefined {
    return this.props.productId;
  }

  get description(): string {
    return this.props.description;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  get discountPercent(): number {
    return this.props.discountPercent;
  }

  get total(): number {
    return this.props.total;
  }

  public static create(
    props: Omit<BudgetItemProps, 'total'> & { total?: number },
    id: string,
  ): Result<BudgetItem> {
    if (!props.description || props.description.trim().length === 0) {
      return Result.fail<BudgetItem>('Item description is required');
    }
    if (props.quantity <= 0) {
      return Result.fail<BudgetItem>('Quantity must be greater than zero');
    }
    if (props.unitPrice < 0) {
      return Result.fail<BudgetItem>('Unit price cannot be negative');
    }
    const discount = props.discountPercent || 0;
    if (discount < 0 || discount > 100) {
      return Result.fail<BudgetItem>('Discount percent must be between 0 and 100');
    }

    const calculatedTotal =
      Math.round(props.quantity * props.unitPrice * (1 - discount / 100) * 100) / 100;

    return Result.ok<BudgetItem>(
      new BudgetItem(
        {
          ...props,
          discountPercent: discount,
          total: props.total !== undefined ? props.total : calculatedTotal,
        },
        id,
      ),
    );
  }
}
