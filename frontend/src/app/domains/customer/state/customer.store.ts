import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { CustomerApiService } from '../services/customer-api.service';
import { CustomerSummary } from '../models/customer.model';

export interface CustomerState {
  customers: CustomerSummary[];
  total: number;
  page: number;
  limit: number;
  search: string;
  statusFilter: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  total: 0,
  page: 1,
  limit: 10,
  search: '',
  statusFilter: '',
  isLoading: false,
  error: null,
};

export const CustomerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ customers, total, page, limit }) => ({
    totalPages: computed(() => Math.ceil(total() / (limit() || 10))),
    hasCustomers: computed(() => customers().length > 0),
  })),
  withMethods((store, customerApi = inject(CustomerApiService)) => ({
    setSearch(search: string) {
      patchState(store, { search, page: 1 });
      this.loadCustomers();
    },
    setStatusFilter(statusFilter: string) {
      patchState(store, { statusFilter, page: 1 });
      this.loadCustomers();
    },
    setPage(page: number) {
      patchState(store, { page });
      this.loadCustomers();
    },
    setLimit(limit: number) {
      patchState(store, { limit, page: 1 });
      this.loadCustomers();
    },
    loadCustomers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          customerApi
            .list({
              page: store.page(),
              limit: store.limit(),
              search: store.search(),
              status: store.statusFilter(),
            })
            .pipe(
              tap({
                next: (res) => {
                  patchState(store, {
                    customers: res.data,
                    total: res.total,
                    isLoading: false,
                  });
                },
                error: (err) => {
                  patchState(store, {
                    isLoading: false,
                    error: err.message || 'Failed to load customers',
                  });
                },
              }),
            ),
        ),
      ),
    ),
  })),
);
