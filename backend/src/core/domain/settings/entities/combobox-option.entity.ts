import { Entity } from '../../common/entity.base.js';
import { Result } from '../../common/result.js';
import { ComboboxCategory, isValidComboboxCategory } from '../value-objects/combobox-category.vo.js';

export interface ComboboxOptionProps {
  orgId: string;
  category: ComboboxCategory;
  value: string;
  label: string;
  orderIndex: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ComboboxOption extends Entity<ComboboxOptionProps> {
  get orgId(): string {
    return this.props.orgId;
  }

  get category(): ComboboxCategory {
    return this.props.category;
  }

  get value(): string {
    return this.props.value;
  }

  get label(): string {
    return this.props.label;
  }

  get orderIndex(): number {
    return this.props.orderIndex;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(props: {
    label?: string;
    orderIndex?: number;
    isActive?: boolean;
  }): Result<void> {
    if (props.label !== undefined) {
      if (!props.label || props.label.trim().length === 0) {
        return Result.fail<void>('Label cannot be empty');
      }
      this.props.label = props.label.trim();
    }

    if (props.orderIndex !== undefined) {
      if (props.orderIndex < 0) {
        return Result.fail<void>('Order index cannot be negative');
      }
      this.props.orderIndex = Math.floor(props.orderIndex);
    }

    if (props.isActive !== undefined) {
      this.props.isActive = props.isActive;
    }

    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public static create(props: ComboboxOptionProps, id: string): Result<ComboboxOption> {
    if (!props.orgId || props.orgId.trim().length === 0) {
      return Result.fail<ComboboxOption>('Organization ID is required');
    }

    if (!isValidComboboxCategory(props.category)) {
      return Result.fail<ComboboxOption>(`Invalid combobox category: ${props.category}`);
    }

    if (!props.value || props.value.trim().length === 0) {
      return Result.fail<ComboboxOption>('Option value is required');
    }

    if (!props.label || props.label.trim().length === 0) {
      return Result.fail<ComboboxOption>('Option label is required');
    }

    const cleanProps: ComboboxOptionProps = {
      orgId: props.orgId.trim(),
      category: props.category,
      value: props.value.trim(),
      label: props.label.trim(),
      orderIndex: typeof props.orderIndex === 'number' && props.orderIndex >= 0 ? Math.floor(props.orderIndex) : 0,
      isDefault: props.isDefault ?? false,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };

    return Result.ok<ComboboxOption>(new ComboboxOption(cleanProps, id));
  }
}
