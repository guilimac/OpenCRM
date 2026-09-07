import {
  Component,
  ElementRef,
  ViewChild,
  input,
  model,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmailAttachment } from '../../../domains/customer/models/customer.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-file-attachments',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe],
  template: `
    <div class="attachments-wrapper">
      <div class="attachments-header flex-row space-between">
        <div class="flex-row align-center gap-xs">
          <mat-icon class="section-icon">attachment</mat-icon>
          <span class="section-title">{{ 'EMAIL.ATTACHMENTS_LABEL' | translate }}</span>
          @if (attachments().length > 0) {
            <span class="count-badge">({{ attachments().length }})</span>
          }
        </div>

        <button
          mat-stroked-button
          type="button"
          class="attach-btn"
          (click)="triggerFileInput()"
          [disabled]="disabled()"
        >
          <mat-icon class="icon-sm">add</mat-icon>
          <span>{{ 'EMAIL.ATTACH_FILES_BTN' | translate }}</span>
        </button>
      </div>

      <!-- Hidden native file input -->
      <input
        #fileInput
        type="file"
        multiple
        class="hidden-file-input"
        (change)="onFileInputChange($event)"
      />

      <!-- Drag & Drop Dropzone / helper -->
      <div
        class="dropzone"
        [class.is-dragover]="isDragOver()"
        [class.disabled]="disabled()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="triggerFileInput()"
      >
        <mat-icon class="dropzone-icon">cloud_upload</mat-icon>
        <span class="dropzone-text">{{ 'EMAIL.DROP_FILES_HERE' | translate }}</span>
        <span class="dropzone-hint">{{ 'EMAIL.MAX_SIZE_INFO' | translate }}</span>
      </div>

      <!-- Error alert -->
      @if (errorMessage()) {
        <div class="attachment-error flex-row align-center gap-xs">
          <mat-icon class="icon-sm error-icon">error_outline</mat-icon>
          <span>{{ errorMessage() }}</span>
        </div>
      }

      <!-- Attached files chips/items -->
      @if (attachments().length > 0) {
        <div class="attachment-chips flex-row flex-wrap gap-xs">
          @for (att of attachments(); track att.filename + $index) {
            <div class="attachment-chip flex-row align-center">
              <mat-icon class="chip-file-icon">description</mat-icon>
              <span class="chip-filename" [title]="att.filename">{{ att.filename }}</span>
              <span class="chip-size">{{ formatBytes(att.size) }}</span>
              <button
                type="button"
                mat-icon-button
                class="chip-remove-btn"
                [attr.aria-label]="'EMAIL.REMOVE_ATTACHMENT' | translate"
                [matTooltip]="'EMAIL.REMOVE_ATTACHMENT' | translate"
                (click)="removeAttachment($index, $event)"
                [disabled]="disabled()"
              >
                <mat-icon class="icon-xs">close</mat-icon>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .attachments-wrapper {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .attachments-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-icon {
      font-size: 1.15rem;
      width: 1.15rem;
      height: 1.15rem;
      color: #64748b;
    }

    .section-title {
      font-size: 0.85rem;
      font-weight: 500;
      color: #334155;
    }

    :host-context(.dark-theme) .section-title {
      color: #cbd5e1;
    }

    .count-badge {
      font-size: 0.8rem;
      font-weight: 600;
      color: #2563eb;
    }

    .attach-btn {
      height: 32px;
      padding: 0 12px;
      font-size: 0.8rem;
      line-height: 32px;
    }

    .hidden-file-input {
      display: none;
    }

    .dropzone {
      border: 1.5px dashed #cbd5e1;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      text-align: center;
      background: #f8fafc;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.2s ease-in-out;
    }

    .dropzone:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .dropzone.is-dragover {
      border-color: #2563eb;
      background: #dbeafe;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }

    .dropzone.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    :host-context(.dark-theme) .dropzone {
      border-color: #475569;
      background: #1e293b;
    }

    :host-context(.dark-theme) .dropzone:hover {
      border-color: #60a5fa;
      background: #1e3a5f;
    }

    .dropzone-icon {
      font-size: 1.4rem;
      width: 1.4rem;
      height: 1.4rem;
      color: #64748b;
    }

    .dropzone-text {
      font-size: 0.82rem;
      color: #475569;
      font-weight: 500;
    }

    :host-context(.dark-theme) .dropzone-text {
      color: #94a3b8;
    }

    .dropzone-hint {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .attachment-error {
      padding: 0.4rem 0.65rem;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      border-radius: 6px;
      font-size: 0.8rem;
    }

    :host-context(.dark-theme) .attachment-error {
      background: #450a0a;
      color: #fca5a5;
      border-color: #7f1d1d;
    }

    .attachment-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .attachment-chip {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 0.2rem 0.4rem 0.2rem 0.6rem;
      font-size: 0.8rem;
      max-width: 100%;
      box-sizing: border-box;
    }

    :host-context(.dark-theme) .attachment-chip {
      background: #334155;
      border-color: #475569;
      color: #f1f5f9;
    }

    .chip-file-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #3b82f6;
      margin-right: 0.3rem;
    }

    .chip-filename {
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #1e293b;
      font-weight: 500;
    }

    :host-context(.dark-theme) .chip-filename {
      color: #f8fafc;
    }

    .chip-size {
      font-size: 0.72rem;
      color: #64748b;
      margin-left: 0.35rem;
      margin-right: 0.1rem;
    }

    :host-context(.dark-theme) .chip-size {
      color: #94a3b8;
    }

    .chip-remove-btn {
      width: 22px;
      height: 22px;
      line-height: 22px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
    }

    .chip-remove-btn:hover {
      color: #ef4444;
    }

    .flex-row {
      display: flex;
      flex-direction: row;
    }

    .flex-wrap {
      flex-wrap: wrap;
    }

    .space-between {
      justify-content: space-between;
    }

    .align-center {
      align-items: center;
    }

    .gap-xs {
      gap: 0.25rem;
    }

    .icon-sm {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .icon-xs {
      font-size: 0.85rem;
      width: 0.85rem;
      height: 0.85rem;
    }
  `],
})
export class FileAttachmentsComponent {
  @ViewChild('fileInput') private fileInputRef?: ElementRef<HTMLInputElement>;

  private readonly i18n = inject(I18nService);

  readonly attachments = model<EmailAttachment[]>([]);
  readonly maxFileSizeMb = input<number>(10);
  readonly maxTotalSizeMb = input<number>(20);
  readonly disabled = input<boolean>(false);

  readonly isDragOver = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  triggerFileInput(): void {
    if (this.disabled()) return;
    this.fileInputRef?.nativeElement.click();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
      input.value = ''; // Reset input so same file can be re-selected if removed
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled()) {
      this.isDragOver.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    if (this.disabled()) return;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  async handleFiles(files: File[]): Promise<void> {
    this.errorMessage.set(null);
    const maxFileSizeBytes = this.maxFileSizeMb() * 1024 * 1024;
    const maxTotalSizeBytes = this.maxTotalSizeMb() * 1024 * 1024;

    let currentTotalSize = this.attachments().reduce((acc, a) => acc + a.size, 0);
    const validNewAttachments: EmailAttachment[] = [];

    for (const file of files) {
      // Validate individual file size
      if (file.size > maxFileSizeBytes) {
        const errorMsg = this.i18n.t('EMAIL.FILE_TOO_LARGE', { name: file.name });
        this.errorMessage.set(errorMsg);
        return;
      }

      // Validate total size
      if (currentTotalSize + file.size > maxTotalSizeBytes) {
        this.errorMessage.set(this.i18n.t('EMAIL.TOTAL_SIZE_EXCEEDED'));
        return;
      }

      try {
        const base64Content = await this.fileToBase64(file);
        validNewAttachments.push({
          filename: file.name,
          content: base64Content,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
        });
        currentTotalSize += file.size;
      } catch (err) {
        console.error('Failed to read file:', file.name, err);
      }
    }

    if (validNewAttachments.length > 0) {
      this.attachments.update((current) => [...current, ...validNewAttachments]);
    }
  }

  removeAttachment(index: number, event?: Event): void {
    event?.stopPropagation();
    this.errorMessage.set(null);
    this.attachments.update((current) => current.filter((_, i) => i !== index));
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${formatted} ${sizes[i]}`;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
