import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../../core/services/i18n.service';
import { ComboboxOptionsService } from '../../../../core/services/combobox-options.service';
import {
  ComboboxCategory,
  ComboboxOptionItem,
  CATEGORY_METADATA_LIST,
  CategoryMeta,
} from '../../models/combobox-settings.model';
import {
  ComboboxOptionDialogComponent,
  ComboboxOptionDialogData,
} from './combobox-option-dialog.component';

@Component({
  selector: 'app-combobox-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSlideToggleModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  templateUrl: './combobox-settings.component.html',
  styleUrls: ['./combobox-settings.component.scss'],
})
export class ComboboxSettingsComponent implements OnInit {
  private readonly comboboxService = inject(ComboboxOptionsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly i18n = inject(I18nService);

  readonly categoryList: CategoryMeta[] = CATEGORY_METADATA_LIST;
  readonly displayedColumns: string[] = ['orderIndex', 'label', 'value', 'isActive', 'actions'];

  readonly selectedCategory = signal<ComboboxCategory>(ComboboxCategory.CUSTOMER_INDUSTRY);
  readonly searchTerm = signal<string>('');
  readonly loading = signal<boolean>(false);

  readonly currentCategoryMeta = computed(() =>
    this.categoryList.find((c) => c.category === this.selectedCategory()),
  );

  private readonly rawOptions = computed(() =>
    this.comboboxService.getAllOptions(this.selectedCategory())(),
  );

  readonly filteredOptions = computed(() => {
    const list = this.rawOptions();
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.value.toLowerCase().includes(query),
    );
  });

  ngOnInit(): void {
    this.comboboxService.loadOptions();
  }

  selectCategory(category: ComboboxCategory): void {
    this.selectedCategory.set(category);
    this.searchTerm.set('');
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  getActiveCount(category: ComboboxCategory): number {
    return this.comboboxService.getOptions(category)().length;
  }

  openAddDialog(): void {
    const meta = this.currentCategoryMeta();
    const categoryTitle = meta ? this.i18n.t(meta.titleKey) : this.selectedCategory();

    const dialogRef = this.dialog.open<ComboboxOptionDialogComponent, ComboboxOptionDialogData>(
      ComboboxOptionDialogComponent,
      {
        data: {
          category: this.selectedCategory(),
          categoryTitle,
        },
      },
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.set(true);
        this.comboboxService
          .createOption({
            category: this.selectedCategory(),
            value: result.value,
            label: result.label,
            orderIndex: result.orderIndex,
            isActive: result.isActive,
          })
          .subscribe({
            next: () => {
              this.loading.set(false);
              this.snackBar.open(this.i18n.t('SETTINGS.MSG_CREATED_SUCCESS'), 'OK', {
                duration: 3000,
              });
            },
            error: (err) => {
              this.loading.set(false);
              const msg = err?.error?.message || this.i18n.t('SETTINGS.MSG_ERROR');
              this.snackBar.open(msg, 'OK', { duration: 4000 });
            },
          });
      }
    });
  }

  openEditDialog(item: ComboboxOptionItem): void {
    const meta = this.currentCategoryMeta();
    const categoryTitle = meta ? this.i18n.t(meta.titleKey) : this.selectedCategory();

    const dialogRef = this.dialog.open<ComboboxOptionDialogComponent, ComboboxOptionDialogData>(
      ComboboxOptionDialogComponent,
      {
        data: {
          category: this.selectedCategory(),
          categoryTitle,
          option: item,
        },
      },
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.set(true);
        this.comboboxService
          .updateOption(item.id, this.selectedCategory(), {
            label: result.label,
            orderIndex: result.orderIndex,
            isActive: result.isActive,
          })
          .subscribe({
            next: () => {
              this.loading.set(false);
              this.snackBar.open(this.i18n.t('SETTINGS.MSG_UPDATED_SUCCESS'), 'OK', {
                duration: 3000,
              });
            },
            error: (err) => {
              this.loading.set(false);
              const msg = err?.error?.message || this.i18n.t('SETTINGS.MSG_ERROR');
              this.snackBar.open(msg, 'OK', { duration: 4000 });
            },
          });
      }
    });
  }

  toggleActive(item: ComboboxOptionItem, active: boolean): void {
    this.comboboxService
      .updateOption(item.id, this.selectedCategory(), {
        isActive: active,
      })
      .subscribe({
        next: () => {
          this.snackBar.open(
            active
              ? this.i18n.t('SETTINGS.MSG_ACTIVATED')
              : this.i18n.t('SETTINGS.MSG_DEACTIVATED'),
            'OK',
            { duration: 2500 },
          );
        },
        error: () => {
          this.snackBar.open(this.i18n.t('SETTINGS.MSG_ERROR'), 'OK', { duration: 3000 });
        },
      });
  }

  moveOrder(item: ComboboxOptionItem, delta: number): void {
    const newOrder = Math.max(0, item.orderIndex + delta);
    this.comboboxService
      .updateOption(item.id, this.selectedCategory(), {
        orderIndex: newOrder,
      })
      .subscribe({
        error: () => {
          this.snackBar.open(this.i18n.t('SETTINGS.MSG_ERROR'), 'OK', { duration: 3000 });
        },
      });
  }

  confirmDelete(item: ComboboxOptionItem): void {
    const prompt = this.i18n.t('SETTINGS.CONFIRM_DELETE', { label: item.label });
    if (!confirm(prompt)) return;

    this.loading.set(true);
    this.comboboxService.deleteOption(item.id, this.selectedCategory()).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open(this.i18n.t('SETTINGS.MSG_DELETED_SUCCESS'), 'OK', {
          duration: 3000,
        });
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || this.i18n.t('SETTINGS.MSG_ERROR');
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      },
    });
  }

  confirmResetCategory(): void {
    const meta = this.currentCategoryMeta();
    const title = meta ? this.i18n.t(meta.titleKey) : this.selectedCategory();
    const prompt = this.i18n.t('SETTINGS.CONFIRM_RESET', { category: title });
    if (!confirm(prompt)) return;

    this.loading.set(true);
    this.comboboxService.resetCategory(this.selectedCategory()).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open(this.i18n.t('SETTINGS.MSG_RESET_SUCCESS'), 'OK', {
          duration: 3000,
        });
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || this.i18n.t('SETTINGS.MSG_ERROR');
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      },
    });
  }
}
