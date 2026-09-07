export interface ProductItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  category: string;
  unitPrice: number;
  unit: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductForm {
  code: string;
  name: string;
  description?: string;
  category?: string;
  unitPrice: number;
  unit?: string;
  currency?: string;
  isActive?: boolean;
}

export interface UpdateProductForm {
  code?: string;
  name?: string;
  description?: string;
  category?: string;
  unitPrice?: number;
  unit?: string;
  currency?: string;
  isActive?: boolean;
}
