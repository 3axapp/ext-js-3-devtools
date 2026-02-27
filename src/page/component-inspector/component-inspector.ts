import {findComponentAndHost, highlightSelectedElement, unHighlight} from './highlighter';
import {ComponentNode} from '../forest';

interface Events {
  componentEnter: (component: ComponentNode) => void;
  componentSelect: (component: ComponentNode) => void;
  componentLeave: () => void;
}

export class ComponentInspector {
  private _selectedComponent!: {component: ComponentNode | null; host: HTMLElement | null};
  private listeners: Events = {
    componentEnter: () => void 0,
    componentSelect: () => void 0,
    componentLeave: () => void 0,
  };

  public constructor() {
    this.bindMethods();
  }

  public on<E extends keyof Events>(event: E, listener: Events[E]) {
    this.listeners[event] = listener;
  }

  public startInspecting(): void {
    window.addEventListener('mouseover', this.elementMouseOver, true);
    window.addEventListener('click', this.elementClick, true);
    window.addEventListener('mouseout', this.cancelEvent, true);
  }

  public stopInspecting(): void {
    window.removeEventListener('mouseover', this.elementMouseOver, true);
    window.removeEventListener('click', this.elementClick, true);
    window.removeEventListener('mouseout', this.cancelEvent, true);
    unHighlight();
  }

  public highlightComponent(component: ComponentNode) {
    const el = document.getElementById(component.id);
    const host = el && findComponentAndHost(el)?.host;
    unHighlight();
    if (host) {
      highlightSelectedElement(host);
    }
  }

  private elementClick(e: MouseEvent): void {
    e.stopImmediatePropagation();
    e.preventDefault();

    if (this._selectedComponent.component && this._selectedComponent.host) {
      this.listeners.componentSelect(this._selectedComponent.component);
    }
  }

  private elementMouseOver(e: MouseEvent): void {
    this.cancelEvent(e);

    const el = e.target as HTMLElement;
    if (el) {
      this._selectedComponent = findComponentAndHost(el);
    }

    unHighlight();
    if (this._selectedComponent.component && this._selectedComponent.host) {
      highlightSelectedElement(this._selectedComponent.host);
      this.listeners.componentEnter(this._selectedComponent.component);
    }
  }

  private cancelEvent(e: MouseEvent): void {
    e.stopImmediatePropagation();
    e.preventDefault();
    this.listeners.componentLeave();
  }

  private bindMethods(): void {
    this.startInspecting = this.startInspecting.bind(this);
    this.stopInspecting = this.stopInspecting.bind(this);
    this.elementMouseOver = this.elementMouseOver.bind(this);
    this.elementClick = this.elementClick.bind(this);
    this.cancelEvent = this.cancelEvent.bind(this);
  }
}
