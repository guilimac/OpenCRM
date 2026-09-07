import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CustomerDetail,
  CustomerSummary,
  PaginatedCustomers,
  CreateCustomerForm,
  SendCustomerEmailPayload,
  CustomerListItem,
  CustomerListDetail,
  CreateCustomerListPayload,
  SendMassEmailPayload,
  MassEmailResult,
} from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/customers';
  private readonly listsUrl = '/api/v1/customer-lists';

  list(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Observable<PaginatedCustomers> {
    let params = new HttpParams();
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.search) params = params.set('search', options.search);
    if (options.status) params = params.set('status', options.status);

    return this.http.get<PaginatedCustomers>(this.baseUrl, { params });
  }

  getById(id: string): Observable<CustomerDetail> {
    return this.http.get<CustomerDetail>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateCustomerForm): Observable<CustomerSummary> {
    return this.http.post<CustomerSummary>(this.baseUrl, data);
  }

  sendCustomerEmail(
    customerId: string,
    payload: SendCustomerEmailPayload,
  ): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.post<{ success: boolean; message: string; data: any }>(
      `${this.baseUrl}/${customerId}/send-email`,
      payload,
    );
  }

  listCustomerLists(): Observable<{ data: CustomerListItem[]; total: number }> {
    return this.http.get<{ data: CustomerListItem[]; total: number }>(this.listsUrl);
  }

  getCustomerListById(id: string): Observable<CustomerListDetail> {
    return this.http.get<CustomerListDetail>(`${this.listsUrl}/${id}`);
  }

  createCustomerList(payload: CreateCustomerListPayload): Observable<CustomerListItem> {
    return this.http.post<CustomerListItem>(this.listsUrl, payload);
  }

  sendMassEmail(
    listId: string,
    payload: SendMassEmailPayload,
  ): Observable<{ success: boolean; message: string; data: MassEmailResult }> {
    return this.http.post<{ success: boolean; message: string; data: MassEmailResult }>(
      `${this.listsUrl}/${listId}/send-mass-email`,
      payload,
    );
  }
}

