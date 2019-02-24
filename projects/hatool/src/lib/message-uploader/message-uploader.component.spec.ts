import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageUploaderComponent } from './message-uploader.component';

describe('MessageUploaderComponent', () => {
  let component: MessageUploaderComponent;
  let fixture: ComponentFixture<MessageUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
