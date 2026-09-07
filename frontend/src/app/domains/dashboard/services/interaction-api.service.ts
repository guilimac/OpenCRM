import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InteractionItem } from '../models/interaction.model';

@Injectable({ providedIn: 'root' })
export class InteractionApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/interactions';

  list(): Observable<InteractionItem[]> {
    return this.http.get<InteractionItem[]>(this.baseUrl);
  }
}
