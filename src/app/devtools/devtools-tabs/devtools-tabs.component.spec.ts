import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevtoolsTabsComponent } from './devtools-tabs.component';

describe('DevtoolsTabsComponent', () => {
  let component: DevtoolsTabsComponent;
  let fixture: ComponentFixture<DevtoolsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevtoolsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevtoolsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
