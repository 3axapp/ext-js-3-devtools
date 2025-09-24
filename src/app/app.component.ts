/// <reference types="chrome"/>
import {Component, OnInit} from '@angular/core';
import '../environments/environment';
import {PortBus} from './protocols/port-bus';
import {DevtoolsComponent} from './devtools/devtools.component';

@Component({
  selector: 'app-root',
  imports: [DevtoolsComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss',
  providers: [
    {
      provide: PortBus,
      useFactory: () => {
        const port = chrome.runtime.connect({name: '' + chrome.devtools.inspectedWindow.tabId});

        return new PortBus(port);
      },
    },
  ],
})
export class AppComponent implements OnInit {
  protected title = 'ext-js-3-devtools';

  public ngOnInit(): void {
    chrome.devtools.network.onNavigated.addListener(() => {
      window.location.reload();
    });
  }
}
