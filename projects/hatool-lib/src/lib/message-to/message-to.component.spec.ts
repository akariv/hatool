import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageToComponent } from './message-to.component';

describe('MessageToComponent', () => {
  let component: MessageToComponent;
  let fixture: ComponentFixture<MessageToComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageToComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageToComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
