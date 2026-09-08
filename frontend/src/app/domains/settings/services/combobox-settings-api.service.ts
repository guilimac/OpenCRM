import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ComboboxCategory,
  ComboboxOptionItem,
  CreateComboboxOptionPayload,
  UpdateComboboxOptionPayload,
} from '../models/combobox-settings.model';

@Injectable({ providedIn: 'root' })
export class ComboboxSettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/settings/comboboxes';

  getAll(category?: ComboboxCategory): Observable<ComboboxOptionItem[]> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<ComboboxOptionItem[]>(this.baseUrl, { params });
  }

  getByCategory(category: ComboboxCategory): Observable<ComboboxOptionItem[]> {
    return this.http.get<ComboboxOptionItem[]>(`${this.baseUrl}/${category}`);
  }

  create(payload: CreateComboboxOptionPayload): Observable<ComboboxOptionItem> {
    return this.http.post<ComboboxOptionItem>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateComboboxOptionPayload): Observable<ComboboxOptionItem> {
    return this.http.put<ComboboxOptionItem>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
  }

  resetCategory(category: ComboboxCategory): Observable<ComboboxOptionItem[]> {
    return this.http.post<ComboboxOptionItem[]>(`${this.baseUrl}/reset/${category}`, {});
  }
}
