import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { ContentService } from '../content.service';
import { ContentManager } from '../content-manager';

@Component({
  selector: 'htl-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.less']
})
export class InputComponent implements OnInit, OnChanges {

  @Input() content: ContentManager;
  @Input() inputEnabled: boolean;
  @Input() textArea: boolean;
  @Input() placeholder: string;
  @Input() validator: (any) => boolean;
  @ViewChild('input') input: ElementRef;

  value = null;
  valid = true;

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.validate();
    }, 0);
  }

  ngOnChanges() {
    window.setTimeout(() => {
      if (this.input) {
        const el: HTMLElement = this.input.nativeElement;
        if (el) {
          el.focus();
        }
      }
    }, 0);
  }

  onChange(event) {
    this.value = event.target.value;
    event.target.value = '';
  }

  onSubmit() {
    const el = this.input.nativeElement;
    this.value = el.value;
    el.value = '';
    if (this.value.length > 0) {
      this.content.addFrom(this.value);
    }
  }

  validate() {
    if (this.input) {
      const value = this.input.nativeElement.value;
      this.valid = !this.validator || this.validator(value);
    } else {
      this.valid = !this.validator || this.validator('');
    }
    return this.valid;
  }
}
