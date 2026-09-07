import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">
      {{ statusLabel }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-lead { background-color: #e0f2fe; color: #0369a1; }
    .badge-prospect { background-color: #fef3c7; color: #b45309; }
    .badge-active { background-color: #dcfce7; color: #15803d; }
    .badge-churned { background-color: #fee2e2; color: #b91c1c; }
    .badge-inactive { background-color: #f1f5f9; color: #64748b; }
    .badge-discovery { background-color: #ede9fe; color: #6d28d9; }
    .badge-qualification { background-color: #e0e7ff; color: #4338ca; }
    .badge-proposal { background-color: #fef9c3; color: #a16207; }
    .badge-negotiation { background-color: #ffedd5; color: #c2410c; }
    .badge-won { background-color: #d1fae5; color: #047857; }
    .badge-lost { background-color: #ffe4e6; color: #be123c; }
  `],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;

  get badgeClass(): string {
    const s = (this.status || '').toUpperCase();
    switch (s) {
      case 'LEAD': return 'badge-lead';
      case 'PROSPECT': return 'badge-prospect';
      case 'ACTIVE_CUSTOMER': return 'badge-active';
      case 'CHURNED': return 'badge-churned';
      case 'INACTIVE': return 'badge-inactive';
      case 'DISCOVERY': return 'badge-discovery';
      case 'QUALIFICATION': return 'badge-qualification';
      case 'PROPOSAL': return 'badge-proposal';
      case 'NEGOTIATION': return 'badge-negotiation';
      case 'CLOSED_WON': return 'badge-won';
      case 'CLOSED_LOST': return 'badge-lost';
      default: return 'badge-inactive';
    }
  }

  get statusLabel(): string {
    return (this.status || '').replace(/_/g, ' ');
  }
}
