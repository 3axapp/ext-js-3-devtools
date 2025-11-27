/// <reference types="chrome"/>
import {TabManager} from './tab-manager';

const tabManager = new TabManager(chrome.runtime);

tabManager.initialize();

chrome.alarms.create('keepAlive', {periodInMinutes: 0.4});

chrome.alarms.onAlarm.addListener(alarm => {
  console.log(alarm.name);
  //   try {
  //     chrome.runtime.getManifest();
  //   } catch (e) {
  //     // ignore
  //   }
});
