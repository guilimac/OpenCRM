import { Entity } from '../../common/entity.base.js';
import { Result } from '../../common/result.js';

export interface ProductProps {
  orgId: string;
  code: string;
  name: string;
  description?: string | null;
  category: string;
  unitPrice: number;
  unit: string;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends Entity<ProductProps> {
  get orgId(): string {
    return this.props.orgId;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get category(): string {
    return this.props.category;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  get unit(): string {
    return this.props.unit;
  }

  get currency(): string {
    return this.props.currency;
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

  public update(props: Partial<Omit<ProductProps, 'orgId' | 'createdAt' | 'updatedAt'>>): Result<void> {
    if (props.code !== undefined && (!props.code || props.code.trim().length === 0)) {
      return Result.fail<void>('Product code/SKU cannot be empty');
    }
    if (props.name !== undefined && (!props.name || props.name.trim().length === 0)) {
      return Result.fail<void>('Product name cannot be empty');
    }
    if (props.unitPrice !== undefined && props.unitPrice < 0) {
      return Result.fail<void>('Unit price cannot be negative');
    }

    if (props.code !== undefined) this.props.code = props.code.trim().toUpperCase();
    if (props.name !== undefined) this.props.name = props.name.trim();
    if (props.description !== undefined) this.props.description = props.description;
    if (props.category !== undefined) this.props.category = props.category;
    if (props.unitPrice !== undefined) this.props.unitPrice = Math.round(props.unitPrice * 100) / 100;
    if (props.unit !== undefined) this.props.unit = props.unit.trim();
    if (props.currency !== undefined) this.props.currency = props.currency.toUpperCase().trim();
    if (props.isActive !== undefined) this.props.isActive = props.isActive;

    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public static create(props: ProductProps, id: string): Result<Product> {
    if (!props.orgId) {
      return Result.fail<Product>('Organization ID is required');
    }
    if (!props.code || props.code.trim().length === 0) {
      return Result.fail<Product>('Product code/SKU is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      return Result.fail<Product>('Product name is required');
    }
    if (props.unitPrice === undefined || props.unitPrice < 0) {
      return Result.fail<Product>('Unit price must be zero or greater');
    }

    const cleanProps: ProductProps = {
      ...props,
      code: props.code.trim().toUpperCase(),
      name: props.name.trim(),
      category: props.category ? props.category.trim() : 'PRODUTO',
      unitPrice: Math.round(props.unitPrice * 100) / 100,
      unit: props.unit ? props.unit.trim() : 'un',
      currency: props.currency ? props.currency.toUpperCase().trim() : 'BRL',
      isActive: props.isActive !== undefined ? props.isActive : true,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };

    return Result.ok<Product>(new Product(cleanProps, id));
  }
}
