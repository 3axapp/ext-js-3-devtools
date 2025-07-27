import {Component, computed, effect, ElementRef, input, output, signal, viewChild} from '@angular/core';
import {FlatNode} from '../models/flat-node';
import {MatCard} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-breadcrumbs',
  imports: [MatCard, MatIcon, MatButton],
  templateUrl: './breadcrumbs.component.html',
  standalone: true,
  styleUrl: './breadcrumbs.component.scss',
})
export class BreadcrumbsComponent {
  readonly parents = input.required<FlatNode[]>();
  readonly handleSelect = output<FlatNode>();
  readonly mouseOverNode = output<FlatNode>();
  readonly mouseLeaveNode = output<FlatNode>();

  readonly breadcrumbsScrollContent = viewChild.required<ElementRef>('breadcrumbs');

  readonly showScrollLeftButton = computed(() => {
    const value = this.breadcrumbsScrollLayout();
    return value && value.scrollLeft > 0;
  });

  readonly showScrollRightButton = computed(() => {
    const value = this.breadcrumbsScrollLayout();
    if (!value) {
      return false;
    }
    const {clientWidth, scrollWidth, scrollLeft} = value;
    return scrollWidth > clientWidth && scrollLeft + clientWidth < scrollWidth;
  });

  private readonly breadcrumbsScrollLayout = signal<BreadcrumbsScrollLayout | undefined>(undefined);

  constructor() {
    effect(cleanup => {
      const observer = new ResizeObserver(() => this.updateScrollButtonVisibility());
      observer.observe(this.breadcrumbsScrollContent().nativeElement);
      cleanup(() => observer.disconnect());
    });
  }

  scroll(pixels: number): void {
    this.breadcrumbsScrollContent().nativeElement.scrollLeft += pixels;
    this.updateScrollButtonVisibility();
  }

  updateScrollButtonVisibility(): void {
    const {clientWidth, scrollWidth, scrollLeft} = this.breadcrumbsScrollContent().nativeElement;
    this.breadcrumbsScrollLayout.set({clientWidth, scrollWidth, scrollLeft});
  }
}

interface BreadcrumbsScrollLayout {
  clientWidth: number;
  scrollWidth: number;
  scrollLeft: number;
}
