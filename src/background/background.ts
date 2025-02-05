/// <reference types="chrome"/>
import {TabManager} from './tab-manager';

const tabManager = new TabManager(chrome.runtime);

tabManager.initialize();
