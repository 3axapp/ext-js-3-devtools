import {ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection} from '@angular/core';
import {ThemeService} from './services/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideAppInitializer(() => {
      const theme = inject(ThemeService);
      return theme.initialize();
    }),
  ],
};
