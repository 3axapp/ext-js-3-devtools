import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PropertyViewTreeComponent} from './property-view-tree.component';

describe('PropertyViewTreeComponent', () => {
  let component: PropertyViewTreeComponent;
  let fixture: ComponentFixture<PropertyViewTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyViewTreeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyViewTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
