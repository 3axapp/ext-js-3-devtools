import {Component, computed, input, output} from '@angular/core';
import {FlatNode} from '../properties';
import {PropType} from '../../../../../protocols/messages';

@Component({
  selector: 'app-property-preview',
  imports: [],
  templateUrl: './property-preview.component.html',
  standalone: true,
  styleUrl: './property-preview.component.scss'
})
export class PropertyPreviewComponent {
  readonly node = input.required<FlatNode>();
  readonly inspect = output<void>();
  readonly highlight = output<void>();
  readonly removeHighlight = output<void>();

  readonly isClickableProp = computed(() => {
    const node = this.node();
    return (
      node.prop.descriptor.type === PropType.Function ||
      node.prop.descriptor.type === PropType.HTMLNode ||
      node.prop.descriptor.type === PropType.Component
    );
  });
  readonly isHighlightable = computed(() => {
    const node = this.node();
    return node.prop.descriptor.type === PropType.Component;
  });

}
