import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileAttachmentsComponent } from './file-attachments.component';
import { I18nService } from '../../../core/services/i18n.service';

describe('FileAttachmentsComponent', () => {
  let component: FileAttachmentsComponent;
  let fixture: ComponentFixture<FileAttachmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileAttachmentsComponent],
      providers: [I18nService],
    }).compileComponents();

    fixture = TestBed.createComponent(FileAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with initial empty attachments', () => {
    expect(component).toBeTruthy();
    expect(component.attachments().length).toBe(0);
  });

  it('should format byte sizes correctly', () => {
    expect(component.formatBytes(0)).toBe('0 B');
    expect(component.formatBytes(1024)).toBe('1 KB');
    expect(component.formatBytes(1048576)).toBe('1 MB');
    expect(component.formatBytes(5242880)).toBe('5 MB');
  });

  it('should add valid files to attachments list', async () => {
    const file = new File(['hello world content'], 'test.txt', { type: 'text/plain' });

    await component.handleFiles([file]);

    expect(component.attachments().length).toBe(1);
    expect(component.attachments()[0].filename).toBe('test.txt');
    expect(component.attachments()[0].contentType).toBe('text/plain');
    expect(component.attachments()[0].content).toContain('data:text/plain;base64,');
  });

  it('should reject file exceeding maxFileSizeMb limit', async () => {
    // Mock oversized file with size > 10MB
    const oversizedFile = new File(['x'], 'huge.pdf', { type: 'application/pdf' });
    Object.defineProperty(oversizedFile, 'size', { value: 15 * 1024 * 1024 });

    await component.handleFiles([oversizedFile]);

    expect(component.attachments().length).toBe(0);
    expect(component.errorMessage()).toBeTruthy();
    expect(component.errorMessage()).toContain('huge.pdf');
  });

  it('should reject file if cumulative total size exceeds maxTotalSizeMb', async () => {
    // Current attachment 18MB
    component.attachments.set([
      {
        filename: 'file1.pdf',
        content: 'data:...',
        contentType: 'application/pdf',
        size: 18 * 1024 * 1024,
      },
    ]);

    // New file 5MB -> total 23MB > 20MB limit
    const newFile = new File(['x'], 'file2.pdf', { type: 'application/pdf' });
    Object.defineProperty(newFile, 'size', { value: 5 * 1024 * 1024 });

    await component.handleFiles([newFile]);

    expect(component.attachments().length).toBe(1);
    expect(component.errorMessage()).toBeTruthy();
  });

  it('should remove an attachment when removeAttachment is called', () => {
    component.attachments.set([
      { filename: 'doc1.pdf', content: 'c1', contentType: 'application/pdf', size: 100 },
      { filename: 'doc2.pdf', content: 'c2', contentType: 'application/pdf', size: 200 },
    ]);

    component.removeAttachment(0);

    expect(component.attachments().length).toBe(1);
    expect(component.attachments()[0].filename).toBe('doc2.pdf');
  });

  it('should handle drag over and drag leave states', () => {
    const dragEvent = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as DragEvent;
    component.onDragOver(dragEvent);
    expect(component.isDragOver()).toBe(true);

    const leaveEvent = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as DragEvent;
    component.onDragLeave(leaveEvent);
    expect(component.isDragOver()).toBe(false);
  });
});
