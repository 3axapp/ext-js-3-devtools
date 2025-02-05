import {Component, input, output} from '@angular/core';
import {MatCard} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-filter',
  imports: [
    MatCard,
    MatIcon,
    MatInput,
    MatTooltip
  ],
  templateUrl: './filter.component.html',
  standalone: true,
  styleUrl: './filter.component.scss'
})
export class FilterComponent {
  readonly filter = output<string>();
  readonly nextMatched = output<void>();
  readonly prevMatched = output<void>();

  readonly hasMatched = input(false);

  emitFilter(event: Event): void {
    this.filter.emit((event.target as HTMLInputElement).value);
  }

  emitNextMatched(): void {
    this.nextMatched.emit();
  }

  emitPrevMatched(): void {
    this.prevMatched.emit();
  }
}
