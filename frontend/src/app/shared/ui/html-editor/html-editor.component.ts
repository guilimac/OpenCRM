import {
  Component,
  ElementRef,
  ViewChild,
  forwardRef,
  inject,
  signal,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-html-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatMenuModule,
    MatDividerModule,
    TranslatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HtmlEditorComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="html-editor-wrapper"
      [class.disabled]="isDisabled()"
      [class.source-active]="isSourceMode()"
    >
      <!-- Toolbar -->
      <div class="editor-toolbar flex-row align-center" role="toolbar" aria-label="Toolbar de Formatação">
        <!-- Text Styling Group -->
        <div class="toolbar-group flex-row">
          <button
            type="button"
            class="toolbar-btn"
            (click)="exec('bold')"
            [disabled]="isDisabled() || isSourceMode()"
            [title]="'HTML_EDITOR.BOLD' | translate"
            [attr.aria-label]="'HTML_EDITOR.BOLD' | translate"
          >
            <mat-icon class="icon-sm">format_bold</mat-icon>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            (click)="exec('italic')"
            [disabled]="isDisabled() || isSourceMode()"
            [title]="'HTML_EDITOR.ITALIC' | translate"
            [attr.aria-label]="'HTML_EDITOR.ITALIC' | translate"
          >
            <mat-icon class="icon-sm">format_italic</mat-icon>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            (click)="exec('underline')"
            [disabled]="isDisabled() || isSourceMode()"
            [title]="'HTML_EDITOR.UNDERLINE' | translate"
            [attr.aria-label]="'HTML_EDITOR.UNDERLINE' | translate"
          >
            <mat-icon class="icon-sm">format_underlined</mat-icon>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            (click)="exec('strikeThrough')"
            [disabled]="isDisabled() || isSourceMode()"
            [title]="'HTML_EDITOR.STRIKE' | translate"
            [attr.aria-label]="'HTML_EDITOR.STRIKE' | translate"
          >
            <mat-icon class="icon-sm">format_strikethrough</mat-icon>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Heading Group -->
        <div class="toolbar-group flex-row">
          <button
            type="button"
            class="toolbar-btn"
            [matMenuTriggerFor]="headingMenu"
            [disabled]="isDisabled() || isSourceMode()"
            title="Títulos e Parágrafo"
          >
            <mat-icon class="icon-sm">title</mat-icon>
            <mat-icon class="icon-xs">arrow_drop_down</mat-icon>
          </button>
          <mat-menu #headingMenu="matMenu">
            <button mat-menu-item (click)="formatBlock('p')">
              <span>{{ 'HTML_EDITOR.PARAGRAPH' | translate }}</span>
            </button>
            <button mat-menu-item (click)="formatBlock('h1')">
              <span class="heading-preview h1">{{ 'HTML_EDITOR.HEADING_1' | translate }}</span>
            </button>
            <button mat-menu-item (click)="formatBlock('h2')">
              <span class="heading-preview h2">{{ 'HTML_EDITOR.HEADING_2' | translate }}</span>
            </button>
            <button mat-menu-item (click)="formatBlock('h3')">
              <span class="heading-preview h3">{{ 'HTML_EDITOR.HEADING_3' | translate }}</span>
            </button>
          </mat-menu>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Lists & Quote Group -->
        <div class="toolbar-group flex-row">
          <button
            type="button"
            class="toolbar-btn"
            (click)="exec('insertUnorderedList')"
            [disabled]="isDisabled() || isSourceMode()"
            [title]="'HTML_EDITOR.BULLET_LIST' | translate"
            [attr.aria-label]="'HTML_EDITOR.BULLET_LIST' | translate"
          >
            <mat-icon class="icon-sm">format_list_bulleted</mat-icon>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            (click)="exec('insertOrderedList')"
            [disabled]="isDisabled() || isSourceMode()"
            [title]="'HTML_EDITOR.NUMBERED_LIST' | translate"
            [attr.aria-label]="'HTML_EDITOR.NUMBERED_LIST' | translate"
          >
            <mat-icon class="icon-sm">format_list_numbered</mat-icon>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            (click)="formatBlock('blockquote')"
            [disabled]="isDisabled() || isSourceMode()"
            [title]="'HTML_EDITOR.BLOCKQUOTE' | translate"
            [attr.aria-label]="'HTML_EDITOR.BLOCKQUOTE' | translate"
          >
            <mat-icon class="icon-sm">format_quote</mat-icon>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Links & Clean Group -->
        <div class="toolbar-group flex-row">
          <button
            type="button"
            class="toolbar-btn"
            (click)="promptLink()"
            [disabled]="isDisabled() || isSourceMode()"
            [title]="'HTML_EDITOR.INSERT_LINK' | translate"
            [attr.aria-label]="'HTML_EDITOR.INSERT_LINK' | translate"
          >
            <mat-icon class="icon-sm">link</mat-icon>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            (click)="exec('unlink')"
            [disabled]="isDisabled() || isSourceMode()"
            [title]="'HTML_EDITOR.REMOVE_LINK' | translate"
            [attr.aria-label]="'HTML_EDITOR.REMOVE_LINK' | translate"
          >
            <mat-icon class="icon-sm">link_off</mat-icon>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            (click)="exec('removeFormat')"
            [disabled]="isDisabled() || isSourceMode()"
            [title]="'HTML_EDITOR.CLEAR_FORMAT' | translate"
            [attr.aria-label]="'HTML_EDITOR.CLEAR_FORMAT' | translate"
          >
            <mat-icon class="icon-sm">format_clear</mat-icon>
          </button>
        </div>

        <div class="flex-spacer"></div>

        <!-- View Mode (Visual / Raw HTML) -->
        <button
          type="button"
          class="toolbar-btn mode-btn"
          [class.active-mode]="isSourceMode()"
          (click)="toggleSourceMode()"
          [disabled]="isDisabled()"
          [title]="(isSourceMode() ? 'HTML_EDITOR.VIEW_VISUAL' : 'HTML_EDITOR.VIEW_SOURCE') | translate"
        >
          <mat-icon class="icon-sm">{{ isSourceMode() ? 'visibility' : 'code' }}</mat-icon>
          <span class="mode-text">{{ isSourceMode() ? 'HTML' : 'Code' }}</span>
        </button>
      </div>

      <!-- Editor Canvas / Source Textarea -->
      <div class="editor-content-area" [style.minHeight]="minHeight" [style.maxHeight]="maxHeight">
        @if (!isSourceMode()) {
          <div
            #editorCanvas
            class="editor-canvas"
            contenteditable="true"
            [attr.data-placeholder]="placeholder || ('HTML_EDITOR.PLACEHOLDER' | translate)"
            (input)="onCanvasInput()"
            (blur)="onCanvasBlur()"
            (focus)="onCanvasFocus()"
          ></div>
        } @else {
          <textarea
            #sourceTextarea
            class="source-textarea"
            [value]="rawHtml()"
            (input)="onSourceChange($any($event.target).value)"
            (blur)="onTouched()"
            placeholder="<html>...</html>"
          ></textarea>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .html-editor-wrapper {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: #ffffff;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    :host-context(.dark-theme) .html-editor-wrapper {
      border-color: #475569;
      background: #1e293b;
    }
    .html-editor-wrapper:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }
    :host-context(.dark-theme) .html-editor-wrapper:focus-within {
      border-color: #60a5fa;
      box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
    }
    .html-editor-wrapper.disabled {
      opacity: 0.6;
      pointer-events: none;
      background: #f8fafc;
    }
    :host-context(.dark-theme) .html-editor-wrapper.disabled {
      background: #0f172a;
    }

    /* Toolbar */
    .editor-toolbar {
      padding: 0.35rem 0.5rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      gap: 0.25rem;
      flex-wrap: wrap;
    }
    :host-context(.dark-theme) .editor-toolbar {
      background: #0f172a;
      border-bottom-color: #334155;
    }
    .toolbar-group {
      gap: 0.15rem;
      align-items: center;
    }
    .toolbar-divider {
      width: 1px;
      height: 18px;
      background-color: #cbd5e1;
      margin: 0 0.25rem;
    }
    :host-context(.dark-theme) .toolbar-divider {
      background-color: #475569;
    }
    .toolbar-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #334155;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }
    :host-context(.dark-theme) .toolbar-btn {
      color: #cbd5e1;
    }
    .toolbar-btn:hover:not(:disabled) {
      background: #e2e8f0;
      color: #0f172a;
    }
    :host-context(.dark-theme) .toolbar-btn:hover:not(:disabled) {
      background: #334155;
      color: #f8fafc;
    }
    .toolbar-btn:disabled {
      color: #94a3b8;
      cursor: not-allowed;
    }
    :host-context(.dark-theme) .toolbar-btn:disabled {
      color: #64748b;
    }
    .mode-btn {
      width: auto;
      padding: 0 0.45rem;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid #cbd5e1;
    }
    :host-context(.dark-theme) .mode-btn {
      border-color: #475569;
    }
    .mode-btn.active-mode {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #1d4ed8;
    }
    :host-context(.dark-theme) .mode-btn.active-mode {
      background: #1e3a8a;
      border-color: #60a5fa;
      color: #93c5fd;
    }

    /* Content Area */
    .editor-content-area {
      position: relative;
      overflow-y: auto;
      min-height: 180px;
    }
    .editor-canvas {
      outline: none;
      padding: 0.85rem 1rem;
      font-family: inherit;
      font-size: 0.925rem;
      color: #1e293b;
      line-height: 1.6;
      min-height: 100%;
      box-sizing: border-box;
      word-break: break-word;
    }
    :host-context(.dark-theme) .editor-canvas {
      color: #f1f5f9;
    }
    .editor-canvas:empty::before {
      content: attr(data-placeholder);
      color: #94a3b8;
      pointer-events: none;
      display: block;
    }
    :host-context(.dark-theme) .editor-canvas:empty::before {
      color: #64748b;
    }
    .source-textarea {
      width: 100%;
      height: 100%;
      min-height: 180px;
      padding: 0.85rem 1rem;
      border: none;
      outline: none;
      font-family: Consolas, Monaco, monospace;
      font-size: 0.85rem;
      line-height: 1.5;
      color: #0f172a;
      background: #f8fafc;
      resize: vertical;
      box-sizing: border-box;
    }
    :host-context(.dark-theme) .source-textarea {
      background: #0f172a;
      color: #e2e8f0;
    }

    /* Content Typography inside editor */
    .editor-canvas p {
      margin: 0 0 0.5rem 0;
    }
    .editor-canvas h1 {
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0.5rem 0;
    }
    .editor-canvas h2 {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0.4rem 0;
    }
    .editor-canvas h3 {
      font-size: 1.05rem;
      font-weight: 600;
      margin: 0.35rem 0;
    }
    .editor-canvas ul, .editor-canvas ol {
      padding-left: 1.5rem;
      margin: 0.35rem 0;
    }
    .editor-canvas blockquote {
      border-left: 3px solid #cbd5e1;
      margin: 0.5rem 0;
      padding-left: 0.75rem;
      color: #64748b;
      font-style: italic;
    }
    :host-context(.dark-theme) .editor-canvas blockquote {
      border-left-color: #475569;
      color: #94a3b8;
    }
    .editor-canvas a {
      color: #2563eb;
      text-decoration: underline;
    }
    :host-context(.dark-theme) .editor-canvas a {
      color: #60a5fa;
    }

    /* Utilities */
    .flex-row {
      display: flex;
      flex-direction: row;
    }
    .align-center {
      align-items: center;
    }
    .flex-spacer {
      flex: 1 1 auto;
    }
    .icon-sm {
      font-size: 1.15rem;
      width: 1.15rem;
      height: 1.15rem;
      vertical-align: middle;
    }
    .icon-xs {
      font-size: 0.95rem;
      width: 0.95rem;
      height: 0.95rem;
      vertical-align: middle;
    }
    .heading-preview.h1 {
      font-size: 1.1rem;
      font-weight: bold;
    }
    .heading-preview.h2 {
      font-size: 0.95rem;
      font-weight: bold;
    }
    .heading-preview.h3 {
      font-size: 0.85rem;
      font-weight: bold;
    }
  `],
})
export class HtmlEditorComponent implements ControlValueAccessor {
  private readonly i18n = inject(I18nService);

  @ViewChild('editorCanvas') editorCanvas?: ElementRef<HTMLDivElement>;
  @ViewChild('sourceTextarea') sourceTextarea?: ElementRef<HTMLTextAreaElement>;

  @Input() placeholder = '';
  @Input() minHeight = '180px';
  @Input() maxHeight = '340px';

  readonly isSourceMode = signal<boolean>(false);
  readonly isDisabled = signal<boolean>(false);
  readonly rawHtml = signal<string>('');

  private lastSavedRange: Range | null = null;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string | null | undefined): void {
    const val = value || '';
    this.rawHtml.set(val);
    if (this.editorCanvas?.nativeElement) {
      this.editorCanvas.nativeElement.innerHTML = val;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    if (this.editorCanvas?.nativeElement) {
      this.editorCanvas.nativeElement.contentEditable = isDisabled ? 'false' : 'true';
    }
  }

  exec(command: string, value: string | undefined = undefined): void {
    if (this.isDisabled() || this.isSourceMode()) return;
    this.restoreSelection();
    if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
      document.execCommand(command, false, value);
    }
    this.saveSelection();
    this.updateContent();
  }

  formatBlock(tag: string): void {
    if (this.isDisabled() || this.isSourceMode()) return;
    this.restoreSelection();
    const formattedTag = tag.startsWith('<') ? tag : `<${tag}>`;
    if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
      document.execCommand('formatBlock', false, formattedTag);
    }
    this.saveSelection();
    this.updateContent();
  }

  promptLink(): void {
    if (this.isDisabled() || this.isSourceMode()) return;
    this.restoreSelection();
    const url = prompt(this.i18n.t('HTML_EDITOR.ENTER_URL'), 'https://');
    if (url && url.trim()) {
      if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
        document.execCommand('createLink', false, url.trim());
      }
      this.saveSelection();
      this.updateContent();
    }
  }

  insertText(text: string): void {
    if (this.isDisabled()) return;

    if (this.isSourceMode()) {
      const textarea = this.sourceTextarea?.nativeElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        textarea.value = val.substring(0, start) + text + val.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        this.onSourceChange(textarea.value);
        textarea.focus();
      } else {
        this.onSourceChange(this.rawHtml() + text);
      }
      return;
    }

    const canvas = this.editorCanvas?.nativeElement;
    if (!canvas) return;

    canvas.focus();
    this.restoreSelection();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (canvas.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        this.saveSelection();
        this.updateContent();
        return;
      }
    }

    // Fallback: append text node
    canvas.appendChild(document.createTextNode(text));
    this.saveSelection();
    this.updateContent();
  }

  toggleSourceMode(): void {
    const switchingToSource = !this.isSourceMode();
    if (switchingToSource) {
      if (this.editorCanvas?.nativeElement) {
        this.rawHtml.set(this.editorCanvas.nativeElement.innerHTML);
      }
    } else {
      setTimeout(() => {
        if (this.editorCanvas?.nativeElement) {
          this.editorCanvas.nativeElement.innerHTML = this.rawHtml();
        }
      });
    }
    this.isSourceMode.set(switchingToSource);
  }

  onCanvasInput(): void {
    this.saveSelection();
    this.updateContent();
  }

  onCanvasFocus(): void {
    this.saveSelection();
  }

  onCanvasBlur(): void {
    this.saveSelection();
    this.onTouched();
  }

  onSourceChange(value: string): void {
    this.rawHtml.set(value);
    this.onChange(value);
  }

  private updateContent(): void {
    const html = this.editorCanvas?.nativeElement.innerHTML || '';
    const normalized = html === '<br>' || html === '<p><br></p>' ? '' : html;
    this.rawHtml.set(normalized);
    this.onChange(normalized);
  }

  private saveSelection(): void {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && this.editorCanvas?.nativeElement) {
      const range = sel.getRangeAt(0);
      if (this.editorCanvas.nativeElement.contains(range.commonAncestorContainer)) {
        this.lastSavedRange = range.cloneRange();
      }
    }
  }

  private restoreSelection(): void {
    if (this.lastSavedRange && this.editorCanvas?.nativeElement) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.lastSavedRange);
      }
    }
  }
}
