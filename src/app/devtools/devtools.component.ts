import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {DevtoolsTabsComponent} from '../devtools-tabs/devtools-tabs.component';
import {interval} from 'rxjs';
import {Events} from '../protocols/messages';
import {PortBus} from '../protocols/port-bus';

enum ExtJSStatuses {
  /**
   * This page may have Angular but we don't know yet. We're still trying to detect it.
   */
  UNKNOWN,

  /**
   * We've given up on trying to detect Angular. We tried ${DETECT_ANGULAR_ATTEMPTS} times and
   * failed.
   */
  DOES_NOT_EXIST,

  /**
   * Angular was detected somewhere on the page.
   */
  EXISTS,
}

const DETECT_ATTEMPTS = 5;

@Component({
  selector: 'app-devtools',
  imports: [
    DevtoolsTabsComponent
  ],
  templateUrl: './devtools.component.html',
  standalone: true,
  styleUrl: './devtools.component.scss'
})
export class DevtoolsComponent implements OnInit, OnDestroy {
  readonly ExtJSStatuses = ExtJSStatuses;
  readonly extJSStatus = signal(ExtJSStatuses.UNKNOWN);

  private readonly _messageBus = inject<PortBus<Events>>(PortBus);

  private _detectorInterval$ = interval(500).subscribe(attempt => {
    if (attempt === DETECT_ATTEMPTS) {
      this.extJSStatus.set(ExtJSStatuses.DOES_NOT_EXIST);
    }
    this._messageBus.emit('queryExtJSAvailability');
  });

  ngOnInit(): void {
    this._messageBus.on('contentScriptConnected', (frameId: number, name: string, url: string) => {
      this.extJSStatus.set(ExtJSStatuses.UNKNOWN);
      this._messageBus.emit('enableFrameConnection', frameId, chrome.devtools.inspectedWindow.tabId);

      this._detectorInterval$.unsubscribe();
      this._detectorInterval$ = interval(500).subscribe(attempt => {
        if (attempt === DETECT_ATTEMPTS) {
          this.extJSStatus.set(ExtJSStatuses.DOES_NOT_EXIST);
        }
        this._messageBus.emit('queryExtJSAvailability');
      });
    });
    this._messageBus.on('extJSAvailability', ({exists}) => {
      this.extJSStatus.set(exists ? ExtJSStatuses.EXISTS : ExtJSStatuses.DOES_NOT_EXIST);
      this._detectorInterval$.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this._detectorInterval$.unsubscribe();
  }
}
