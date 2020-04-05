import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageMultiOptionsComponent } from './message-multi-options.component';

describe('MessageMultiOptionsComponent', () => {
  let component: MessageMultiOptionsComponent;
  let fixture: ComponentFixture<MessageMultiOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageMultiOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageMultiOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
