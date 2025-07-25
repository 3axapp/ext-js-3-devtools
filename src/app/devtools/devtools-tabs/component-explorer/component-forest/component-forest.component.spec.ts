import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentForestComponent } from './component-forest.component';

describe('ComponentForestComponent', () => {
  let component: ComponentForestComponent;
  let fixture: ComponentFixture<ComponentForestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentForestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentForestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
