import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HtmlEditorComponent } from './html-editor.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('HtmlEditorComponent', () => {
  let component: HtmlEditorComponent;
  let fixture: ComponentFixture<HtmlEditorComponent>;

  beforeEach(async () => {
    if (!document.execCommand) {
      (document as any).execCommand = vi.fn();
    }

    await TestBed.configureTestingModule({
      imports: [HtmlEditorComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HtmlEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the editor component with default state', () => {
    expect(component).toBeTruthy();
    expect(component.isSourceMode()).toBe(false);
    expect(component.isDisabled()).toBe(false);
    expect(component.rawHtml()).toBe('');
  });

  it('should write value to canvas and signal via writeValue', () => {
    component.writeValue('<p>Hello <strong>World</strong></p>');
    expect(component.rawHtml()).toBe('<p>Hello <strong>World</strong></p>');
    expect(component.editorCanvas?.nativeElement.innerHTML).toBe('<p>Hello <strong>World</strong></p>');
  });

  it('should handle null or undefined in writeValue', () => {
    component.writeValue(null);
    expect(component.rawHtml()).toBe('');
    expect(component.editorCanvas?.nativeElement.innerHTML).toBe('');
  });

  it('should notify form control via registered onChange and onTouched callbacks', () => {
    const onChangeFn = vi.fn();
    const onTouchedFn = vi.fn();

    component.registerOnChange(onChangeFn);
    component.registerOnTouched(onTouchedFn);

    component.editorCanvas!.nativeElement.innerHTML = '<p>Novo texto</p>';
    component.onCanvasInput();

    expect(onChangeFn).toHaveBeenCalledWith('<p>Novo texto</p>');
    expect(component.rawHtml()).toBe('<p>Novo texto</p>');

    component.onCanvasBlur();
    expect(onTouchedFn).toHaveBeenCalled();
  });

  it('should set disabled state properly', () => {
    component.setDisabledState(true);
    expect(component.isDisabled()).toBe(true);
    expect(component.editorCanvas?.nativeElement.contentEditable).toBe('false');

    component.setDisabledState(false);
    expect(component.isDisabled()).toBe(false);
    expect(component.editorCanvas?.nativeElement.contentEditable).toBe('true');
  });

  it('should toggle between visual WYSIWYG mode and raw HTML mode', () => {
    component.writeValue('<p>Teste de modo</p>');
    expect(component.isSourceMode()).toBe(false);

    component.toggleSourceMode();
    fixture.detectChanges();
    expect(component.isSourceMode()).toBe(true);
    expect(component.sourceTextarea?.nativeElement.value).toBe('<p>Teste de modo</p>');

    component.onSourceChange('<h1>Título Alterado</h1>');
    expect(component.rawHtml()).toBe('<h1>Título Alterado</h1>');

    component.toggleSourceMode();
    fixture.detectChanges();
    expect(component.isSourceMode()).toBe(false);
  });

  it('should insert text at canvas when calling insertText in visual mode', () => {
    const onChangeFn = vi.fn();
    component.registerOnChange(onChangeFn);

    component.insertText('{{companyName}}');

    expect(component.editorCanvas?.nativeElement.textContent).toContain('{{companyName}}');
    expect(onChangeFn).toHaveBeenCalled();
  });

  it('should execute document.execCommand when formatting tools are clicked', () => {
    const execSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);

    component.exec('bold');
    expect(execSpy).toHaveBeenCalledWith('bold', false, undefined);

    component.formatBlock('h2');
    expect(execSpy).toHaveBeenCalledWith('formatBlock', false, '<h2>');

    execSpy.mockRestore();
  });

  it('should prompt user for URL and create link', () => {
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('https://opencrm.com');
    const execSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);

    component.promptLink();

    expect(promptSpy).toHaveBeenCalled();
    expect(execSpy).toHaveBeenCalledWith('createLink', false, 'https://opencrm.com');

    promptSpy.mockRestore();
    execSpy.mockRestore();
  });
});
