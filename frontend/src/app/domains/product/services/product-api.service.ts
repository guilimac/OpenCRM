import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductItem, CreateProductForm, UpdateProductForm } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/products';

  list(options?: {
    search?: string;
    category?: string;
    isActive?: boolean;
  }): Observable<ProductItem[]> {
    let params = new HttpParams();
    if (options?.search) params = params.set('search', options.search);
    if (options?.category) params = params.set('category', options.category);
    if (options?.isActive !== undefined) params = params.set('isActive', options.isActive.toString());

    return this.http.get<ProductItem[]>(this.baseUrl, { params });
  }

  create(data: CreateProductForm): Observable<ProductItem> {
    return this.http.post<ProductItem>(this.baseUrl, data);
  }

  update(id: string, data: UpdateProductForm): Observable<ProductItem> {
    return this.http.put<ProductItem>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
