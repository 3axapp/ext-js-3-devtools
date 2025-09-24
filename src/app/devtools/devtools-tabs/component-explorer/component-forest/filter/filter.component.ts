import {Component, input, output} from '@angular/core';
import {MatCard} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-filter',
  imports: [MatCard, MatIcon, MatInput, MatTooltip],
  templateUrl: './filter.component.html',
  standalone: true,
  styleUrl: './filter.component.scss',
})
export class FilterComponent {
  public readonly filter = output<string>();
  public readonly nextMatched = output<void>();
  public readonly prevMatched = output<void>();

  public readonly hasMatched = input(false);

  public emitFilter(event: Event): void {
    this.filter.emit((event.target as HTMLInputElement).value);
  }

  public emitNextMatched(): void {
    this.nextMatched.emit();
  }

  public emitPrevMatched(): void {
    this.prevMatched.emit();
  }
}
