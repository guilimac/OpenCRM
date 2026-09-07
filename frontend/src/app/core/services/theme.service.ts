import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _isDarkMode = signal<boolean>(
    localStorage.getItem('theme_preference') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  public readonly isDarkMode = this._isDarkMode.asReadonly();

  constructor() {
    effect(() => {
      const dark = this._isDarkMode();
      if (dark) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme_preference', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme_preference', 'light');
      }
    });
  }

  toggleTheme(): void {
    this._isDarkMode.update((current) => !current);
  }
}
