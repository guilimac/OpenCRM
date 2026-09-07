import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BudgetDetail, CreateBudgetPayload, BudgetStatus } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/budgets';

  list(options?: {
    customerId?: string;
    opportunityId?: string;
    status?: string;
    search?: string;
  }): Observable<BudgetDetail[]> {
    let params = new HttpParams();
    if (options?.customerId) params = params.set('customerId', options.customerId);
    if (options?.opportunityId) params = params.set('opportunityId', options.opportunityId);
    if (options?.status) params = params.set('status', options.status);
    if (options?.search) params = params.set('search', options.search);

    return this.http.get<BudgetDetail[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<BudgetDetail> {
    return this.http.get<BudgetDetail>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateBudgetPayload): Observable<BudgetDetail> {
    return this.http.post<BudgetDetail>(this.baseUrl, payload);
  }

  updateStatus(id: string, status: BudgetStatus): Observable<BudgetDetail> {
    return this.http.patch<BudgetDetail>(`${this.baseUrl}/${id}/status`, { status });
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
