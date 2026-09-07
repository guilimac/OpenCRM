import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { I18nService } from '../../core/services/i18n.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let i18nService: I18nService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TranslatePipe, I18nService],
    });

    pipe = TestBed.inject(TranslatePipe);
    i18nService = TestBed.inject(I18nService);
  });

  it('should translate in Portuguese by default', () => {
    expect(pipe.transform('COMMON.SAVE')).toBe('Salvar');
  });

  it('should react to language changes', () => {
    expect(pipe.transform('COMMON.SAVE')).toBe('Salvar');
    i18nService.setLanguage('en');
    expect(pipe.transform('COMMON.SAVE')).toBe('Save');
  });

  it('should handle interpolation parameters', () => {
    expect(
      pipe.transform('CUSTOMER_LISTS.SELECTED_COUNT', { count: 3 }),
    ).toBe('3 selecionado(s)');

    i18nService.setLanguage('en');
    expect(
      pipe.transform('CUSTOMER_LISTS.SELECTED_COUNT', { count: 3 }),
    ).toBe('3 selected');
  });

  it('should return empty string if key is empty', () => {
    expect(pipe.transform('')).toBe('');
  });
});
