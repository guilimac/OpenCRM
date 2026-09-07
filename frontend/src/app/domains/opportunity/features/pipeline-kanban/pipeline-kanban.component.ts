import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OpportunityStore } from '../../state/opportunity.store';
import { OpportunityItem, OpportunityStage } from '../../models/opportunity.model';
import { BrlCurrencyPipe } from '../../../../shared/pipes/brl-currency.pipe';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-pipeline-kanban',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    BrlCurrencyPipe,
    TranslatePipe,
  ],
  template: `
    <div class="pipeline-container">
      <!-- Metric Highlights in BRL -->
      <header class="pipeline-header">
        <div>
          <h1 class="pipeline-title">{{ 'PIPELINE.TITLE' | translate }}</h1>
          <p class="pipeline-subtitle">{{ 'PIPELINE.SUBTITLE' | translate }}</p>
        </div>
        <div class="header-metrics flex-row gap-md">
          <div class="metric-card card-elevation">
            <span class="metric-label">{{ 'PIPELINE.TOTAL_VALUE' | translate }}</span>
            <span class="metric-val primary">
              {{ store.totalPipelineValueInBrl() | brlCurrency:'BRL' }}
            </span>
          </div>
          <div class="metric-card card-elevation">
            <span class="metric-label">{{ 'PIPELINE.WEIGHTED_REVENUE' | translate }}</span>
            <span class="metric-val success">
              {{ store.totalWeightedValueInBrl() | brlCurrency:'BRL' }}
            </span>
          </div>
        </div>
      </header>

      <!-- Kanban Board -->
      <div class="kanban-board">
        @for (stage of stages; track stage.id) {
          <div class="kanban-column card-elevation" role="region" [attr.aria-label]="stage.labelKey | translate">
            <div class="column-header flex-row">
              <div class="flex-row gap-sm">
                <span class="column-title">{{ stage.labelKey | translate }}</span>
                <span class="column-count">
                  {{ store.dealsByStage()[stage.id]?.length || 0 }}
                </span>
              </div>
              <div class="flex-spacer"></div>
              <span class="column-prob">{{ stage.probability }}%</span>
            </div>

            <div
              cdkDropList
              [id]="stage.id"
              [cdkDropListData]="store.dealsByStage()[stage.id] || []"
              [cdkDropListConnectedTo]="connectedDropLists"
              class="deal-list"
              (cdkDropListDropped)="onDrop($event, stage.id)"
            >
              @for (deal of store.dealsByStage()[stage.id] || []; track deal.id) {
                <div cdkDrag class="deal-card card-elevation">
                  <div class="deal-card-header flex-row">
                    <span class="deal-customer">{{ deal.customerName || ('CUSTOMER.TITLE' | translate) }}</span>
                    <div class="flex-spacer"></div>
                    @if (deal.currency !== 'BRL') {
                      <span class="currency-tag">{{ deal.currency }}</span>
                    }
                  </div>

                  <h3 class="deal-title">{{ deal.title }}</h3>

                  <div class="deal-values">
                    <div class="deal-amount">
                      {{ deal.amount | brlCurrency:deal.currency }}
                    </div>
                    @if (deal.currency !== 'BRL') {
                      <div class="deal-brl-converted">
                        ≈ {{ deal.amountInBrl | brlCurrency:'BRL' }}
                      </div>
                    }
                  </div>

                  <div class="deal-footer flex-row">
                    <span class="deal-date flex-row gap-sm">
                      <mat-icon class="icon-sm">event</mat-icon>
                      {{ deal.expectedCloseDate | date:'dd/MM/yyyy' }}
                    </span>
                    <div class="flex-spacer"></div>
                    <span class="deal-weighted">
                      {{ 'PIPELINE.WEIGHTED_FORECAST' | translate }} {{ deal.weightedValueInBrl | brlCurrency:'BRL' }}
                    </span>
                  </div>
                </div>
              }

              @if ((store.dealsByStage()[stage.id] || []).length === 0) {
                <div class="empty-column">{{ 'PIPELINE.DRAG_HERE' | translate }}</div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .pipeline-container {
      padding: 1.5rem;
      max-width: 100%;
      box-sizing: border-box;
    }
    .pipeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .pipeline-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .pipeline-subtitle {
      color: #64748b;
      margin: 0.25rem 0 0;
    }
    .header-metrics {
      display: flex;
      flex-wrap: wrap;
    }
    .metric-card {
      background: #ffffff;
      padding: 0.75rem 1.25rem;
      border-radius: 0.5rem;
      display: flex;
      flex-direction: column;
      min-width: 220px;
    }
    :host-context(.dark-theme) .metric-card {
      background: #1e293b;
    }
    .metric-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 0.25rem;
    }
    .metric-val {
      font-size: 1.4rem;
      font-weight: 700;
    }
    .metric-val.primary {
      color: #2563eb;
    }
    .metric-val.success {
      color: #16a34a;
    }
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      align-items: flex-start;
      overflow-x: auto;
      padding-bottom: 1rem;
    }
    .kanban-column {
      background: #f1f5f9;
      border-radius: 0.5rem;
      display: flex;
      flex-direction: column;
      min-height: 480px;
      padding: 0.75rem;
    }
    :host-context(.dark-theme) .kanban-column {
      background: #1e293b;
    }
    .column-header {
      padding: 0.5rem 0.25rem 0.75rem;
      border-bottom: 2px solid rgba(0, 0, 0, 0.06);
      margin-bottom: 0.75rem;
    }
    .column-title {
      font-weight: 600;
      font-size: 0.9rem;
      color: #334155;
    }
    :host-context(.dark-theme) .column-title {
      color: #cbd5e1;
    }
    .column-count {
      background: rgba(0, 0, 0, 0.08);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.1rem 0.4rem;
      border-radius: 9999px;
    }
    .column-prob {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
    }
    .deal-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 400px;
    }
    .deal-card {
      background: #ffffff;
      border-radius: 0.5rem;
      padding: 0.85rem;
      cursor: grab;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    :host-context(.dark-theme) .deal-card {
      background: #0f172a;
      border: 1px solid #334155;
    }
    .deal-card:active {
      cursor: grabbing;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    }
    .deal-customer {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }
    .currency-tag {
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
    }
    .deal-title {
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0.4rem 0 0.6rem;
      line-height: 1.3;
    }
    .deal-amount {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
    }
    :host-context(.dark-theme) .deal-amount {
      color: #f8fafc;
    }
    .deal-brl-converted {
      font-size: 0.75rem;
      color: #64748b;
    }
    .deal-footer {
      margin-top: 0.75rem;
      padding-top: 0.5rem;
      border-top: 1px solid #f1f5f9;
      font-size: 0.75rem;
      color: #64748b;
    }
    :host-context(.dark-theme) .deal-footer {
      border-top-color: #1e293b;
    }
    .icon-sm {
      font-size: 0.85rem;
      width: 0.85rem;
      height: 0.85rem;
    }
    .deal-weighted {
      font-weight: 600;
      color: #16a34a;
    }
    .empty-column {
      text-align: center;
      padding: 2rem 1rem;
      color: #94a3b8;
      font-size: 0.85rem;
      border: 1px dashed #cbd5e1;
      border-radius: 0.5rem;
    }
  `],
})
export class PipelineKanbanComponent implements OnInit {
  readonly store = inject(OpportunityStore);

  readonly stages: Array<{ id: OpportunityStage; labelKey: string; probability: number }> = [
    { id: 'DISCOVERY', labelKey: 'PIPELINE.STAGE_DISCOVERY', probability: 10 },
    { id: 'QUALIFICATION', labelKey: 'PIPELINE.STAGE_QUALIFICATION', probability: 25 },
    { id: 'PROPOSAL', labelKey: 'PIPELINE.STAGE_PROPOSAL', probability: 50 },
    { id: 'NEGOTIATION', labelKey: 'PIPELINE.STAGE_NEGOTIATION', probability: 75 },
    { id: 'CLOSED_WON', labelKey: 'PIPELINE.STAGE_CLOSED_WON', probability: 100 },
    { id: 'CLOSED_LOST', labelKey: 'PIPELINE.STAGE_CLOSED_LOST', probability: 0 },
  ];

  get connectedDropLists(): string[] {
    return this.stages.map((s) => s.id);
  }

  ngOnInit(): void {
    this.store.loadPipeline();
  }

  onDrop(event: CdkDragDrop<OpportunityItem[]>, targetStage: OpportunityStage): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedItem = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      if (movedItem) {
        this.store.moveDealStage(movedItem.id, targetStage);
      }
    }
  }
}
