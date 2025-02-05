import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevtoolsComponent } from './devtools.component';

describe('DevtoolsComponent', () => {
  let component: DevtoolsComponent;
  let fixture: ComponentFixture<DevtoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevtoolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevtoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
