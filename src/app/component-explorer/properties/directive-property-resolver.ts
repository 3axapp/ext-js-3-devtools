import {FlatTreeControl} from '@angular/cdk/tree';
import {PropertyDataSource} from './property-data-source';
import {FlatNode, Property} from './properties';
import {PortBus} from '../../protocols/port-bus';
import {ComponentProperties, Descriptor, DirectivePosition, Events, Properties} from '../../protocols/messages';
import {getTreeFlattener} from './flatten';

export interface DirectiveTreeData {
  dataSource: PropertyDataSource;
  treeControl: FlatTreeControl<FlatNode>;
}

const getDirectiveControls = (
  dataSource: PropertyDataSource,
): { dataSource: PropertyDataSource; treeControl: FlatTreeControl<FlatNode> } => {
  const treeControl = dataSource.treeControl;
  return {
    dataSource,
    treeControl,
  };
};

export const constructPathOfKeysToPropertyValue = (
  nodePropToGetKeysFor: Property,
  keys: string[] = [],
): string[] => {
  keys.unshift(nodePropToGetKeysFor.name);
  const parentNodeProp = nodePropToGetKeysFor.parent;
  if (parentNodeProp) {
    constructPathOfKeysToPropertyValue(parentNodeProp, keys);
  }
  return keys;
};

export class DirectivePropertyResolver {
  private _treeFlattener = getTreeFlattener();

  private _treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  private _stateDataSource: PropertyDataSource;
  private _initialConfigSource: PropertyDataSource;
  private _listenersControls: PropertyDataSource;

  constructor(
    private _messageBus: PortBus<Events>,
    private _props: ComponentProperties,
    private _directivePosition: DirectivePosition,
  ) {
    const {stateProps, initialConfigProps, listenersProps} = this._classifyProperties();

    this._stateDataSource = this._createDataSourceFromProps(stateProps);
    this._initialConfigSource = this._createDataSourceFromProps(initialConfigProps, ['initialConfig']);
    this._listenersControls = this._createDataSourceFromProps(listenersProps, ['listeners']);
  }

  get directiveStateControls(): DirectiveTreeData {
    return getDirectiveControls(this._stateDataSource);
  }

  get initialConfigControls(): DirectiveTreeData {
    return getDirectiveControls(this._initialConfigSource);
  }

  get listenersControls(): DirectiveTreeData {
    return getDirectiveControls(this._listenersControls);
  }

  get directiveProperties() {
    return this._props;
  }

  get directivePosition(): DirectivePosition {
    return this._directivePosition;
  }

  private _createDataSourceFromProps(props: { [name: string]: Descriptor }, parents?: string[]): PropertyDataSource {
    return new PropertyDataSource(
      props,
      parents,
      this._treeFlattener,
      this._treeControl,
      this._directivePosition,
      this._messageBus,
    );
  }

  private _classifyProperties(): Record<'stateProps'|'initialConfigProps'|'listenersProps', { [name: string]: Descriptor }> {

    const stateProps = this.directiveProperties.properties.props;
    const initialConfigProps = this.directiveProperties.initialConfig.props;
    const listenersProps = this.directiveProperties.listeners.props;

    return {
      stateProps,
      initialConfigProps,
      listenersProps,
    };
  }
}
