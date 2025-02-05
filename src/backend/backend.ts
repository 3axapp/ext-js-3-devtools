import {WindowBus} from '../page/window-bus';
import {Events, Topic} from '../app/protocols/messages';

let backgroundDisconnected = false;

const DESTINATION = 'extjs-devtools';
const SOURCE = DESTINATION + '-backend';

const windowBus = new WindowBus<Events>(SOURCE, DESTINATION);
const port = chrome.runtime.connect({name: 'backend'});

const events: Topic[] = [
  'extJSAvailability',
  'latestComponentExplorerView',
  'backendReady',
  'nestedProperties',
  'selectComponent',
  'highlightComponent',
  'removeComponentHighlight',
];

for (let event of events) {
  windowBus.on(event, (...args: any[]) => {
    if (backgroundDisconnected) {
      return;
    }
    port.postMessage({topic: event, args});
  });
}

port.onDisconnect.addListener(() => {
  console.log('port disconnect')
  backgroundDisconnected = true;
  windowBus.emit('shutdown');
  windowBus.destroy();
});

port.onMessage.addListener((m) => {
  windowBus.emit(m.topic, ...m.args);
});


const s = document.createElement("script");
s.src = chrome.runtime.getURL("/page.js");
(document.head || document.documentElement).appendChild(s);

