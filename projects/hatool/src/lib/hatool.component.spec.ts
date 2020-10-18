import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HatoolComponent } from './hatool.component';

describe('HatoolComponent', () => {
  let component: HatoolComponent;
  let fixture: ComponentFixture<HatoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HatoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HatoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
