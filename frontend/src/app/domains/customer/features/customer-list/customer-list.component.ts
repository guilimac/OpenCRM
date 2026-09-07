import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { CustomerStore } from '../../state/customer.store';
import { CustomerApiService } from '../../services/customer-api.service';
import { CustomerSummary } from '../../models/customer.model';
import { SendCustomerEmailDialogComponent } from '../send-customer-email-dialog/send-customer-email-dialog.component';
import { CreateCustomerDialogComponent } from '../create-customer-dialog/create-customer-dialog.component';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import { BrlCurrencyPipe } from '../../../../shared/pipes/brl-currency.pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    StatusBadgeComponent,
    BrlCurrencyPipe,
    TranslatePipe,
  ],
  template: `
    <div class="page-container">
      <header class="page-header flex-row">
        <div>
          <h1 class="page-title">{{ 'CUSTOMER.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'CUSTOMER.SUBTITLE' | translate }}</p>
        </div>
        <div class="flex-spacer"></div>
        <button
          mat-flat-button
          color="primary"
          class="gap-sm"
          (click)="openCreateCustomerDialog()"
        >
          <mat-icon>add</mat-icon>
          {{ 'CUSTOMER.NEW_CUSTOMER' | translate }}
        </button>
      </header>

      <!-- Filter and Search Bar -->
      <div class="filter-bar card-elevation flex-row gap-md">
        <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
          <mat-label>{{ 'CUSTOMER.SEARCH_PLACEHOLDER' | translate }}</mat-label>
          <input
            matInput
            [ngModel]="store.search()"
            (ngModelChange)="onSearchChange($event)"
            [placeholder]="'CUSTOMER.SEARCH_PLACEHOLDER' | translate"
          />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'CUSTOMER.STATUS_FILTER' | translate }}</mat-label>
          <mat-select [ngModel]="store.statusFilter()" (ngModelChange)="onStatusChange($event)">
            <mat-option value="">{{ 'CUSTOMER.STATUS_ALL' | translate }}</mat-option>
            <mat-option value="LEAD">{{ 'CUSTOMER.STATUS_LEAD' | translate }}</mat-option>
            <mat-option value="PROSPECT">{{ 'CUSTOMER.STATUS_PROSPECT' | translate }}</mat-option>
            <mat-option value="ACTIVE_CUSTOMER">{{ 'CUSTOMER.STATUS_ACTIVE_CUSTOMER' | translate }}</mat-option>
            <mat-option value="CHURNED">{{ 'CUSTOMER.STATUS_CHURNED' | translate }}</mat-option>
            <mat-option value="INACTIVE">{{ 'CUSTOMER.STATUS_INACTIVE' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Data Table Card -->
      <div class="table-card card-elevation">
        @if (store.isLoading()) {
          <div class="spinner-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        }

        <table mat-table [dataSource]="store.customers()" class="full-width" aria-label="Tabela de Clientes">
          <!-- Company Name Column -->
          <ng-container matColumnDef="companyName">
            <th mat-header-cell *matHeaderCellDef>{{ 'CUSTOMER.COL_COMPANY' | translate }}</th>
            <td mat-cell *matCellDef="let row" class="fw-500">
              {{ row.companyName }}
              @if (row.website) {
                <a [href]="row.website" target="_blank" class="external-link" aria-label="Visitar site">
                  <mat-icon class="inline-icon">open_in_new</mat-icon>
                </a>
              }
            </td>
          </ng-container>

          <!-- Industry Column -->
          <ng-container matColumnDef="industry">
            <th mat-header-cell *matHeaderCellDef>{{ 'CUSTOMER.COL_INDUSTRY' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.industry || '—' }}</td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>{{ 'CUSTOMER.COL_STATUS' | translate }}</th>
            <td mat-cell *matCellDef="let row">
              <app-status-badge [status]="row.status"></app-status-badge>
            </td>
          </ng-container>

          <!-- Annual Revenue Column (BRL Currency) -->
          <ng-container matColumnDef="annualRevenue">
            <th mat-header-cell *matHeaderCellDef>{{ 'CUSTOMER.COL_REVENUE' | translate }}</th>
            <td mat-cell *matCellDef="let row">
              {{ row.annualRevenue | brlCurrency:'BRL' }}
            </td>
          </ng-container>

          <!-- Contacts Count Column -->
          <ng-container matColumnDef="contacts">
            <th mat-header-cell *matHeaderCellDef>{{ 'CUSTOMER.COL_CONTACTS' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.contactCount }}</td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'CUSTOMER.COL_ACTIONS' | translate }}</th>
            <td mat-cell *matCellDef="let row" class="text-right">
              <button
                mat-icon-button
                color="primary"
                (click)="openSendEmailDialog(row)"
                aria-label="Enviar e-mail para cliente"
                title="Enviar E-mail"
              >
                <mat-icon>mail</mat-icon>
              </button>
              <button mat-icon-button color="primary" aria-label="Visualizar cliente" title="Visualizar">
                <mat-icon>visibility</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns" class="table-row"></tr>
        </table>

        @if (!store.isLoading() && store.customers().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">business_center</mat-icon>
            <p class="empty-text">{{ 'CUSTOMER.EMPTY_STATE' | translate }}</p>
          </div>
        }

        <mat-paginator
          [length]="store.total()"
          [pageSize]="store.limit()"
          [pageIndex]="store.page() - 1"
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="onPageChange($event)"
          aria-label="Selecionar página de clientes"
        ></mat-paginator>
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
    .filter-bar {
      background: #ffffff;
      padding: 1rem 1.25rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    :host-context(.dark-theme) .filter-bar {
      background: #1e293b;
    }
    .search-field {
      flex: 1 1 300px;
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
    .fw-500 {
      font-weight: 500;
    }
    .external-link {
      color: #3b82f6;
      margin-left: 0.25rem;
      text-decoration: none;
    }
    .inline-icon {
      font-size: 1rem;
      vertical-align: middle;
    }
    .text-right {
      text-align: right;
    }
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: #94a3b8;
    }
    .empty-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 0.5rem;
    }
    .empty-text {
      font-size: 1rem;
      margin: 0;
    }
    .table-row:hover {
      background-color: #f1f5f9;
    }
    :host-context(.dark-theme) .table-row:hover {
      background-color: #334155;
    }
  `],
})
export class CustomerListComponent implements OnInit {
  readonly store = inject(CustomerStore);
  private readonly dialog = inject(MatDialog);
  private readonly customerApi = inject(CustomerApiService);

  readonly displayedColumns = [
    'companyName',
    'industry',
    'status',
    'annualRevenue',
    'contacts',
    'actions',
  ];

  ngOnInit(): void {
    this.store.loadCustomers();
  }

  openCreateCustomerDialog(): void {
    const ref = this.dialog.open(CreateCustomerDialogComponent, {
      width: '600px',
      disableClose: true,
    });

    ref.afterClosed().subscribe((created) => {
      if (created) {
        this.store.loadCustomers();
      }
    });
  }

  openSendEmailDialog(customer: CustomerSummary): void {
    this.customerApi.getById(customer.id).subscribe({
      next: (detail) => {
        this.dialog.open(SendCustomerEmailDialogComponent, {
          width: '520px',
          data: {
            customerId: customer.id,
            companyName: customer.companyName,
            contacts: detail.contacts,
          },
        });
      },
      error: () => {
        this.dialog.open(SendCustomerEmailDialogComponent, {
          width: '520px',
          data: {
            customerId: customer.id,
            companyName: customer.companyName,
            contacts: [],
          },
        });
      },
    });
  }

  onSearchChange(search: string): void {
    this.store.setSearch(search);
  }

  onStatusChange(status: string): void {
    this.store.setStatusFilter(status);
  }

  onPageChange(event: PageEvent): void {
    if (event.pageSize !== this.store.limit()) {
      this.store.setLimit(event.pageSize);
    } else {
      this.store.setPage(event.pageIndex + 1);
    }
  }
}
