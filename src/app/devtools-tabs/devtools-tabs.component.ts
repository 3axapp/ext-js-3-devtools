import {Component, inject, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {ComponentExplorerComponent} from '../component-explorer/component-explorer.component';
import {PortBus} from '../protocols/port-bus';
import {Events} from '../protocols/messages';

@Component({
  selector: 'app-devtools-tabs',
  imports: [
    MatIcon,
    MatTooltip,
    ComponentExplorerComponent
  ],
  templateUrl: './devtools-tabs.component.html',
  standalone: true,
  styleUrl: './devtools-tabs.component.scss'
})
export class DevtoolsTabsComponent {
  readonly inspectorRunning = signal(false);
  private readonly _messageBus = inject<PortBus<Events>>(PortBus);

  toggleInspector() {
    this.toggleInspectorState();
    this.emitInspectorEvent();
  }

  toggleInspectorState(): void {
    this.inspectorRunning.update((state) => !state);
  }

  emitInspectorEvent(): void {
    if (this.inspectorRunning()) {
      this._messageBus.emit('inspectorStart');
    } else {
      this._messageBus.emit('inspectorEnd');
    }
  }
}
