import {Component, computed, inject, input, output} from '@angular/core';
import {IndexedNode} from '../component-forest/models/index-forest';
import {FlatTreeControl} from '@angular/cdk/tree';
import {PropertyDataSource} from './property-data-source';
import {ComponentProperties, ElementPath} from '../../../../protocols/messages';
import {MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle} from '@angular/material/expansion';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {PropertyViewTreeComponent} from './property-view-tree/property-view-tree.component';
import {FlatNode} from './properties';
import {PortBus} from '../../../../protocols/port-bus';
import {DirectivePropertyResolver} from './directive-property-resolver';

@Component({
  selector: 'app-properties',
  imports: [
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatTooltip,
    MatIcon,
    PropertyViewTreeComponent,
  ],
  templateUrl: './properties.component.html',
  standalone: true,
  styleUrl: './properties.component.scss',
})
export class PropertiesComponent {
  public currentSelectedElement = input.required<IndexedNode>();
  public properties = input.required<ComponentProperties>();
  private readonly messageBus = inject(PortBus);

  public readonly inspect = output<InspectionData>();
  public readonly highlight = output<InspectionData>();
  public readonly removeHighlight = output<void>();

  protected readonly documentationUrl = 'https://docs.sencha.com/extjs/3.4.0/#!/api/';
  protected readonly documentation = computed<string>(() => {
    return `https://docs.sencha.com/extjs/3.4.0/#!/api/${this.currentSelectedElement().type}`;
  });

  protected readonly panels = computed<Panels>(() => {
    const resolver = new DirectivePropertyResolver(this.messageBus, this.properties(), {
      element: this.currentSelectedElement().path,
      directive: 0,
    });
    return [
      {
        title: 'initialConfig',
        hidden: false,
        controls: resolver.initialConfigControls,
        class: 'cy-properties',
        parents: ['initialConfig'],
      },
      {
        title: 'Слушатели событий',
        hidden: false,
        controls: resolver.listenersControls,
        class: 'cy-properties',
        parents: ['listeners'],
      },
      {
        title: 'Свойства',
        hidden: false,
        controls: resolver.directiveStateControls,
        class: 'cy-properties',
      },
    ];
  });

  protected handleInspect(node: FlatNode, parents?: string[]): void {
    this.inspect.emit({
      node,
      componentPath: this.currentSelectedElement().path,
      parents,
    });
  }

  protected handleHighlight(node: FlatNode, parents?: string[]) {
    this.highlight.emit({
      node,
      componentPath: this.currentSelectedElement().path,
      parents,
    });
  }
}

type Panels = {
  title: string;
  hidden: boolean;
  controls: DirectiveTreeData;
  documentation?: string;
  class: string;
  parents?: string[];
}[];

export interface DirectiveTreeData {
  dataSource: PropertyDataSource;
  treeControl: FlatTreeControl<FlatNode>;
}

export interface InspectionData {
  node: FlatNode;
  componentPath: ElementPath;
  parents?: string[];
}
