import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageOptionsComponent } from './message-options.component';

describe('MessageOptionsComponent', () => {
  let component: MessageOptionsComponent;
  let fixture: ComponentFixture<MessageOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
