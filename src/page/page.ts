import {Detector} from './detector';
import {Events} from '../app/protocols/messages';
import {WindowBus} from './window-bus';
import {DomManager} from './dom-manager';
import {ComponentInspector} from './component-inspector/component-inspector';
import {DevToolsConsole} from './dev-tools-console';
import {StateSerializer} from './state-serializer/state-serializer';

(function () {
  const SOURCE = 'extjs-devtools';
  const DESTINATION = SOURCE + '-backend';

  const domManager = new DomManager(
    new WindowBus<Events>(SOURCE, DESTINATION),
    new Detector(),
    new ComponentInspector(),
    new DevToolsConsole(),
    new StateSerializer(),
  );

  domManager.initialize();
})();
