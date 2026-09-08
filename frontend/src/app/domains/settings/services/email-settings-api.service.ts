import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EmailConfigResponse,
  SaveEmailConfigRequest,
  SendTestEmailRequest,
  SendTestEmailResponse,
} from '../models/email-config.models';

@Injectable({ providedIn: 'root' })
export class EmailSettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/settings/email';

  getConfig(): Observable<EmailConfigResponse | null> {
    return this.http.get<EmailConfigResponse | null>(this.baseUrl);
  }

  saveConfig(payload: SaveEmailConfigRequest): Observable<EmailConfigResponse> {
    return this.http.put<EmailConfigResponse>(this.baseUrl, payload);
  }

  sendTestEmail(payload: SendTestEmailRequest): Observable<SendTestEmailResponse> {
    return this.http.post<SendTestEmailResponse>(`${this.baseUrl}/test`, payload);
  }
}
