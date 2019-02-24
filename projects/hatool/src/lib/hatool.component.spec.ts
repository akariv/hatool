import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HatoolLibComponent } from './hatool.component';

describe('HatoolLibComponent', () => {
  let component: HatoolLibComponent;
  let fixture: ComponentFixture<HatoolLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HatoolLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HatoolLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
