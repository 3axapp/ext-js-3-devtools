import {Component, computed, input, output} from '@angular/core';
import {FlatNode} from '../properties';
import {PropType} from '../../../../../protocols/messages';

@Component({
  selector: 'app-property-preview',
  imports: [],
  templateUrl: './property-preview.component.html',
  standalone: true,
  styleUrl: './property-preview.component.scss',
})
export class PropertyPreviewComponent {
  public readonly node = input.required<FlatNode>();
  public readonly inspect = output<void>();
  public readonly highlight = output<void>();
  public readonly removeHighlight = output<void>();

  protected readonly isClickableProp = computed(() => {
    const node = this.node();
    return (
      node.prop.descriptor.type === PropType.Function ||
      node.prop.descriptor.type === PropType.HTMLNode ||
      node.prop.descriptor.type === PropType.Component
    );
  });

  protected readonly isHighlightable = computed(() => {
    const node = this.node();
    return node.prop.descriptor.type === PropType.Component;
  });
}
