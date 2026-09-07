import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CustomerApiService } from '../../services/customer-api.service';
import { CustomerListItem } from '../../models/customer.model';
import { CreateCustomerListDialogComponent } from '../create-customer-list-dialog/create-customer-list-dialog.component';
import { SendMassEmailDialogComponent } from '../send-mass-email-dialog/send-mass-email-dialog.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-customer-lists',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-container">
      <header class="page-header flex-row space-between align-center">
        <div>
          <h1 class="page-title">{{ 'CUSTOMER_LISTS.TITLE' | translate }}</h1>
          <p class="page-subtitle">
            {{ 'CUSTOMER_LISTS.SUBTITLE' | translate }}
          </p>
        </div>
        <button mat-flat-button color="primary" class="gap-sm" (click)="openCreateListDialog()">
          <mat-icon>add</mat-icon>
          {{ 'CUSTOMER_LISTS.NEW_LIST' | translate }}
        </button>
      </header>

      <!-- Lists Table Card -->
      <div class="table-card card-elevation">
        @if (isLoading()) {
          <div class="spinner-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        }

        <table mat-table [dataSource]="lists()" class="full-width" aria-label="Tabela de Listas de Clientes">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>{{ 'CUSTOMER_LISTS.COL_NAME' | translate }}</th>
            <td mat-cell *matCellDef="let row" class="fw-600">
              {{ row.name }}
            </td>
          </ng-container>

          <!-- Description Column -->
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>{{ 'CUSTOMER_LISTS.COL_DESC' | translate }}</th>
            <td mat-cell *matCellDef="let row" class="desc-cell">
              {{ row.description || '—' }}
            </td>
          </ng-container>

          <!-- Members Column -->
          <ng-container matColumnDef="members">
            <th mat-header-cell *matHeaderCellDef>{{ 'CUSTOMER_LISTS.COL_MEMBERS' | translate }}</th>
            <td mat-cell *matCellDef="let row">
              <span class="member-chip">
                <mat-icon class="icon-xs">group</mat-icon>
                {{ 'CUSTOMER_LISTS.MEMBERS_COUNT' | translate:{ count: row.memberCount } }}
              </span>
            </td>
          </ng-container>

          <!-- Created Date Column -->
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>{{ 'CUSTOMER_LISTS.COL_CREATED_AT' | translate }}</th>
            <td mat-cell *matCellDef="let row">
              {{ row.createdAt | date:'dd/MM/yyyy HH:mm' }}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'COMMON.ACTIONS' | translate }}</th>
            <td mat-cell *matCellDef="let row" class="text-right">
              <button
                mat-flat-button
                color="primary"
                class="btn-sm mr-xs"
                (click)="openSendMassEmailDialog(row)"
                [disabled]="row.memberCount === 0"
                [title]="'CUSTOMER_LISTS.BTN_MASS_EMAIL' | translate"
              >
                <mat-icon class="icon-sm mr-xs">campaign</mat-icon>
                {{ 'CUSTOMER_LISTS.BTN_MASS_EMAIL' | translate }}
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns" class="table-row"></tr>
        </table>

        @if (!isLoading() && lists().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">playlist_add_check</mat-icon>
            <p class="empty-title">{{ 'CUSTOMER_LISTS.EMPTY_TITLE' | translate }}</p>
            <p class="empty-text">{{ 'CUSTOMER_LISTS.EMPTY_TEXT' | translate }}</p>
            <button mat-stroked-button color="primary" class="mt-sm" (click)="openCreateListDialog()">
              <mat-icon>add</mat-icon>
              {{ 'CUSTOMER_LISTS.CREATE_FIRST' | translate }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 1.5rem;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .page-subtitle {
      color: #64748b;
      margin: 0.25rem 0 0;
      font-size: 0.95rem;
    }
    .flex-row {
      display: flex;
      flex-direction: row;
    }
    .space-between {
      justify-content: space-between;
    }
    .align-center {
      align-items: center;
    }
    .gap-sm {
      gap: 0.5rem;
    }
    .table-card {
      background: #ffffff;
      border-radius: 0.5rem;
      overflow: hidden;
      position: relative;
    }
    :host-context(.dark-theme) .table-card {
      background: #1e293b;
    }
    .spinner-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
    }
    :host-context(.dark-theme) .spinner-container {
      background: rgba(15, 23, 42, 0.7);
    }
    .full-width {
      width: 100%;
    }
    .fw-600 {
      font-weight: 600;
    }
    .desc-cell {
      color: #64748b;
      max-width: 320px;
    }
    .member-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background: #eff6ff;
      color: #1d4ed8;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.8rem;
    }
    :host-context(.dark-theme) .member-chip {
      background: #1e3a8a;
      color: #93c5fd;
    }
    .text-right {
      text-align: right;
    }
    .btn-sm {
      font-size: 0.825rem;
    }
    .mr-xs {
      margin-right: 0.25rem;
    }
    .mt-sm {
      margin-top: 0.75rem;
    }
    .icon-xs {
      font-size: 0.95rem;
      width: 0.95rem;
      height: 0.95rem;
    }
    .icon-sm {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      vertical-align: middle;
    }
    .empty-state {
      padding: 3.5rem 1.5rem;
      text-align: center;
      color: #94a3b8;
    }
    .empty-icon {
      font-size: 3.5rem;
      width: 3.5rem;
      height: 3.5rem;
      margin-bottom: 0.5rem;
    }
    .empty-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 0.25rem;
    }
    :host-context(.dark-theme) .empty-title {
      color: #e2e8f0;
    }
    .empty-text {
      font-size: 0.9rem;
      margin: 0;
    }
    .table-row:hover {
      background-color: #f8fafc;
    }
    :host-context(.dark-theme) .table-row:hover {
      background-color: #334155;
    }
  `],
})
export class CustomerListsComponent implements OnInit {
  private readonly customerApi = inject(CustomerApiService);
  private readonly dialog = inject(MatDialog);

  readonly isLoading = signal<boolean>(true);
  readonly lists = signal<CustomerListItem[]>([]);

  readonly displayedColumns = [
    'name',
    'description',
    'members',
    'createdAt',
    'actions',
  ];

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
    this.isLoading.set(true);
    this.customerApi.listCustomerLists().subscribe({
      next: (res) => {
        this.lists.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  openCreateListDialog(): void {
    const ref = this.dialog.open(CreateCustomerListDialogComponent, {
      width: '560px',
      disableClose: true,
    });

    ref.afterClosed().subscribe((created) => {
      if (created) {
        this.loadLists();
      }
    });
  }

  openSendMassEmailDialog(list: CustomerListItem): void {
    this.dialog.open(SendMassEmailDialogComponent, {
      width: '600px',
      data: { list },
    });
  }
}
