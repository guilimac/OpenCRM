import { Injectable, signal, effect } from '@angular/core';
import { pt } from '../i18n/pt';
import { en } from '../i18n/en';

export type SupportedLanguage = 'pt' | 'en';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly dictionaries: Record<SupportedLanguage, any> = { pt, en };

  private readonly _currentLang = signal<SupportedLanguage>(
    (localStorage.getItem('app_language') as SupportedLanguage) || 'pt',
  );

  public readonly currentLang = this._currentLang.asReadonly();

  constructor() {
    effect(() => {
      const lang = this._currentLang();
      localStorage.setItem('app_language', lang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
      }
    });
  }

  setLanguage(lang: SupportedLanguage): void {
    if (this._currentLang() !== lang) {
      this._currentLang.set(lang);
    }
  }

  toggleLanguage(): void {
    this.setLanguage(this._currentLang() === 'pt' ? 'en' : 'pt');
  }

  t(key: string, params?: Record<string, string | number>): string {
    const lang = this._currentLang();
    const dict = this.dictionaries[lang] || this.dictionaries.pt;

    const parts = key.split('.');
    let val: any = dict;

    for (const part of parts) {
      if (val && typeof val === 'object' && part in val) {
        val = val[part];
      } else {
        // Fallback to Portuguese if missing in target language
        let fallbackVal: any = this.dictionaries.pt;
        for (const fbPart of parts) {
          if (fallbackVal && typeof fallbackVal === 'object' && fbPart in fallbackVal) {
            fallbackVal = fallbackVal[fbPart];
          } else {
            return key;
          }
        }
        val = fallbackVal;
        break;
      }
    }

    if (typeof val !== 'string') {
      return key;
    }

    if (params) {
      return Object.entries(params).reduce((str, [k, v]) => {
        return str.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g'), String(v));
      }, val);
    }

    return val;
  }
}
