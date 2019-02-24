import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageFromComponent } from './message-from.component';

describe('MessageFromComponent', () => {
  let component: MessageFromComponent;
  let fixture: ComponentFixture<MessageFromComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageFromComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
