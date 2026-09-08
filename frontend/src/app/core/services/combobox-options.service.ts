import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ComboboxSettingsApiService } from '../../domains/settings/services/combobox-settings-api.service';
import {
  ComboboxCategory,
  ComboboxOptionItem,
  CreateComboboxOptionPayload,
  UpdateComboboxOptionPayload,
} from '../../domains/settings/models/combobox-settings.model';

@Injectable({ providedIn: 'root' })
export class ComboboxOptionsService {
  private readonly api = inject(ComboboxSettingsApiService);

  private readonly _optionsMap = signal<Map<string, ComboboxOptionItem[]>>(new Map());
  private readonly _loaded = signal<boolean>(false);
  private readonly _loading = signal<boolean>(false);

  readonly isLoaded = this._loaded.asReadonly();
  readonly isLoading = this._loading.asReadonly();

  loadOptions(force = false): void {
    if ((this._loaded() && !force) || this._loading()) {
      return;
    }

    this._loading.set(true);
    this.api.getAll().subscribe({
      next: (items) => {
        const nextMap = new Map<string, ComboboxOptionItem[]>();
        for (const item of items) {
          const list = nextMap.get(item.category) || [];
          list.push(item);
          nextMap.set(item.category, list);
        }
        this._optionsMap.set(nextMap);
        this._loaded.set(true);
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
      },
    });
  }

  getOptions(category: ComboboxCategory | string): Signal<ComboboxOptionItem[]> {
    if (!this._loaded() && !this._loading()) {
      this.loadOptions();
    }

    return computed(() => {
      const items = this._optionsMap().get(category) || [];
      return items
        .filter((opt) => opt.isActive)
        .sort((a, b) => a.orderIndex - b.orderIndex || a.label.localeCompare(b.label));
    });
  }

  getAllOptions(category: ComboboxCategory | string): Signal<ComboboxOptionItem[]> {
    if (!this._loaded() && !this._loading()) {
      this.loadOptions();
    }

    return computed(() => {
      const items = this._optionsMap().get(category) || [];
      return [...items].sort((a, b) => a.orderIndex - b.orderIndex || a.label.localeCompare(b.label));
    });
  }

  createOption(payload: CreateComboboxOptionPayload): Observable<ComboboxOptionItem> {
    return this.api.create(payload).pipe(
      tap((newItem) => {
        const currentMap = new Map(this._optionsMap());
        const list = [...(currentMap.get(newItem.category) || []), newItem];
        currentMap.set(newItem.category, list);
        this._optionsMap.set(currentMap);
      }),
    );
  }

  updateOption(
    id: string,
    category: ComboboxCategory | string,
    payload: UpdateComboboxOptionPayload,
  ): Observable<ComboboxOptionItem> {
    return this.api.update(id, payload).pipe(
      tap((updatedItem) => {
        const currentMap = new Map(this._optionsMap());
        const list = (currentMap.get(category) || []).map((item) =>
          item.id === id ? updatedItem : item,
        );
        currentMap.set(category, list);
        this._optionsMap.set(currentMap);
      }),
    );
  }

  deleteOption(id: string, category: ComboboxCategory | string): Observable<{ success: boolean }> {
    return this.api.delete(id).pipe(
      tap(() => {
        const currentMap = new Map(this._optionsMap());
        const list = (currentMap.get(category) || []).filter((item) => item.id !== id);
        currentMap.set(category, list);
        this._optionsMap.set(currentMap);
      }),
    );
  }

  resetCategory(category: ComboboxCategory): Observable<ComboboxOptionItem[]> {
    return this.api.resetCategory(category).pipe(
      tap((reseededItems) => {
        const currentMap = new Map(this._optionsMap());
        currentMap.set(category, reseededItems);
        this._optionsMap.set(currentMap);
      }),
    );
  }
}
