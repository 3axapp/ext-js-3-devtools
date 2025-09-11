import {ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection} from '@angular/core';
import {ThemeService} from './services/theme.service';
import {IconsService} from './services/icons.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideAppInitializer(() => {
      const theme = inject(ThemeService);
      const icons = inject(IconsService);

      return Promise.all([theme.initialize(), icons.initialize()]);
    }),
  ],
};
