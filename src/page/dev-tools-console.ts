export class DevToolsConsole {
  private readonly prefix = '$ext';
  private readonly capacity = 5;

  private list: Ext.Component[] = [];

  public setReference(component: Ext.Component | null) {
    if (!component) {
      return;
    }
    this.before(component);
    this.insert(component);
    this.assign();
  }

  private before(component: Ext.Component) {
    const foundIndex = this.list.indexOf(component);
    if (foundIndex !== -1) {
      this.list.splice(foundIndex, 1);
    } else if (this.list.length === this.capacity) {
      this.list.pop();
    }
  }

  private insert(component: Ext.Component) {
    this.list.unshift(component);
  }

  private assign() {
    this.list.forEach((c, i) => {
      const key = `${this.prefix}${i}`;

      Object.defineProperty(window, key, {
        get: () => c,
        configurable: true,
      });
    });
  }
}
