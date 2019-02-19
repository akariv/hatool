import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageTypingComponent } from './message-typing.component';

describe('MessageTypingComponent', () => {
  let component: MessageTypingComponent;
  let fixture: ComponentFixture<MessageTypingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageTypingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageTypingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
