import {Injectable} from '@angular/core';

const DARK_THEME_CLASS = 'dark-theme';
const LIGHT_THEME_CLASS = 'light-theme';

export type Theme = 'dark-theme' | 'light-theme';
declare const browser: {
  storage: {
    local: {
      get: () => Promise<Record<string, unknown> | void>;
      set: (data: Record<string, unknown>) => Promise<void>;
    };
  };
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private win = window;
  private doc = document;

  public async initialize() {
    this.set(await this.getPrefersDarkMode());
  }

  public toggle() {
    this.set(document.body.className == 'light-theme');
  }

  private async getPrefersDarkMode(): Promise<boolean> {
    const data = await browser.storage.local.get();
    if (data) {
      if (Object.hasOwn(data, 'isDark')) {
        return !!data['isDark'];
      }
    }
    return this.win.matchMedia && this.win.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private set(isDark: boolean): void {
    this.doc.body.className = !isDark ? LIGHT_THEME_CLASS : DARK_THEME_CLASS;

    browser.storage.local.set({isDark});
  }
}
