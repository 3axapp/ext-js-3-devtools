/// <reference types="chrome"/>
import {DOCUMENT, inject, Injectable} from '@angular/core';

const DARK_THEME_CLASS = 'dark-theme';
const LIGHT_THEME_CLASS = 'light-theme';

export type Theme = 'dark-theme' | 'light-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private doc = inject(DOCUMENT);
  private win = this.doc.defaultView!;

  public async initialize() {
    this.set(await this.getPrefersDarkMode());
  }

  public toggle() {
    this.set(this.doc.body.className == 'light-theme');
  }

  private async getPrefersDarkMode(): Promise<boolean> {
    const data = await chrome.storage.local.get();
    if (data) {
      if (Object.hasOwn(data, 'isDark')) {
        return !!data['isDark'];
      }
    }
    return this.win.matchMedia && this.win.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private set(isDark: boolean): void {
    this.doc.body.className = !isDark ? LIGHT_THEME_CLASS : DARK_THEME_CLASS;

    chrome.storage.local.set({isDark});
  }
}
