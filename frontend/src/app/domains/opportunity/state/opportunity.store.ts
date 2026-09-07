import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { OpportunityApiService } from '../services/opportunity-api.service';
import { OpportunityItem, OpportunityStage, PipelineStageSummary } from '../models/opportunity.model';

export interface OpportunityState {
  deals: OpportunityItem[];
  stageSummaries: PipelineStageSummary[];
  totalPipelineValueInBrl: number;
  totalWeightedValueInBrl: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: OpportunityState = {
  deals: [
    {
      id: 'opp-101',
      title: 'Expansão de Infraestrutura Cloud',
      customerId: 'cust-1',
      customerName: 'TechCorp Brasil',
      ownerId: 'usr-1',
      amount: 120000,
      currency: 'BRL',
      exchangeRateToBrl: 1.0,
      amountInBrl: 120000,
      stage: 'DISCOVERY',
      probability: 10,
      weightedValueInBrl: 12000,
      expectedCloseDate: '2026-11-30',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'opp-102',
      title: 'Consultoria de Migração AWS (USD)',
      customerId: 'cust-2',
      customerName: 'Global Retailers Inc',
      ownerId: 'usr-1',
      amount: 25000,
      currency: 'USD',
      exchangeRateToBrl: 5.5,
      amountInBrl: 137500,
      stage: 'PROPOSAL',
      probability: 50,
      weightedValueInBrl: 68750,
      expectedCloseDate: '2026-10-15',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'opp-103',
      title: 'Licenciamento Enterprise Anual',
      customerId: 'cust-3',
      customerName: 'Banco Dinâmico S/A',
      ownerId: 'usr-2',
      amount: 350000,
      currency: 'BRL',
      exchangeRateToBrl: 1.0,
      amountInBrl: 350000,
      stage: 'NEGOTIATION',
      probability: 75,
      weightedValueInBrl: 262500,
      expectedCloseDate: '2026-09-30',
      createdAt: new Date().toISOString(),
    },
  ],
  stageSummaries: [],
  totalPipelineValueInBrl: 607500,
  totalWeightedValueInBrl: 343250,
  isLoading: false,
  error: null,
};

export const OpportunityStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ deals }) => ({
    dealsByStage: computed(() => {
      const stages: OpportunityStage[] = [
        'DISCOVERY',
        'QUALIFICATION',
        'PROPOSAL',
        'NEGOTIATION',
        'CLOSED_WON',
        'CLOSED_LOST',
      ];

      const grouped: Record<OpportunityStage, OpportunityItem[]> = {
        DISCOVERY: [],
        QUALIFICATION: [],
        PROPOSAL: [],
        NEGOTIATION: [],
        CLOSED_WON: [],
        CLOSED_LOST: [],
      };

      for (const deal of deals()) {
        if (grouped[deal.stage]) {
          grouped[deal.stage].push(deal);
        }
      }
      return grouped;
    }),
  })),
  withMethods((store, api = inject(OpportunityApiService)) => ({
    loadPipeline: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          api.getPipelineSummary().pipe(
            tap({
              next: (summary) => {
                patchState(store, {
                  stageSummaries: summary.stages,
                  totalPipelineValueInBrl: summary.totalPipelineValueInBrl,
                  totalWeightedValueInBrl: summary.totalWeightedValueInBrl,
                  isLoading: false,
                });
              },
              error: (err) => {
                patchState(store, {
                  isLoading: false,
                  error: err.message || 'Falha ao carregar funil',
                });
              },
            }),
          ),
        ),
      ),
    ),
    moveDealStage(dealId: string, newStage: OpportunityStage) {
      // Optimistic update
      const updatedDeals = store.deals().map((d) => {
        if (d.id === dealId) {
          return { ...d, stage: newStage };
        }
        return d;
      });
      patchState(store, { deals: updatedDeals });

      // Call backend API
      api.updateStage(dealId, newStage).subscribe({
        error: (err) => {
          patchState(store, { error: err.message || 'Falha ao sincronizar estágio' });
          this.loadPipeline();
        },
      });
    },
  })),
);
