import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OpportunityItem,
  PipelineSummaryResponse,
  CreateOpportunityForm,
  OpportunityStage,
} from '../models/opportunity.model';

@Injectable({ providedIn: 'root' })
export class OpportunityApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/opportunities';

  getPipelineSummary(): Observable<PipelineSummaryResponse> {
    return this.http.get<PipelineSummaryResponse>(`${this.baseUrl}/pipeline-summary`);
  }

  list(): Observable<OpportunityItem[]> {
    return this.http.get<OpportunityItem[]>(this.baseUrl);
  }

  create(data: CreateOpportunityForm): Observable<OpportunityItem> {
    return this.http.post<OpportunityItem>(this.baseUrl, data);
  }

  updateStage(
    id: string,
    stage: OpportunityStage,
    lossReason?: string,
  ): Observable<OpportunityItem> {
    return this.http.patch<OpportunityItem>(`${this.baseUrl}/${id}/stage`, {
      stage,
      lossReason,
    });
  }
}
