import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nService);
  });

  it('should default to Portuguese (pt)', () => {
    expect(service.currentLang()).toBe('pt');
    expect(service.t('COMMON.SAVE')).toBe('Salvar');
    expect(service.t('NAV.PIPELINE')).toBe('Funil de Vendas');
  });

  it('should switch language to English (en)', () => {
    service.setLanguage('en');
    expect(service.currentLang()).toBe('en');
    expect(service.t('COMMON.SAVE')).toBe('Save');
    expect(service.t('NAV.PIPELINE')).toBe('Sales Pipeline');
  });

  it('should interpolate variables', () => {
    expect(service.t('CUSTOMER_LISTS.SELECTED_COUNT', { count: 5 })).toBe('5 selecionado(s)');

    service.setLanguage('en');
    expect(service.t('CUSTOMER_LISTS.SELECTED_COUNT', { count: 5 })).toBe('5 selected');
  });

  it('should fallback gracefully for unknown keys', () => {
    expect(service.t('UNKNOWN.KEY')).toBe('UNKNOWN.KEY');
  });

  it('should toggle language between pt and en', () => {
    expect(service.currentLang()).toBe('pt');
    service.toggleLanguage();
    expect(service.currentLang()).toBe('en');
    service.toggleLanguage();
    expect(service.currentLang()).toBe('pt');
  });
});
