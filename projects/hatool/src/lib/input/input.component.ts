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
  @Input() inputKind: string;
  @Input() inputMin;
  @Input() inputMax;
  @Input() inputStep;
  @Input() placeholder: string;
  @Input() inputRequired = true;
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

  onSubmit() {
    const el = this.input.nativeElement;
    this.value = el.value;
    el.value = '';
    if (this.value.length > 0) {
      this.content.addFrom(this.value);
    }
  }

  validate() {
    console.log('VALIDATE', this.input, this.validator);
    if (this.input) {
      const value = this.input.nativeElement.value;
      console.log('VALUE', value);
      this.valid = !this.inputRequired || !!value;
      console.log('REQUIRED', this.inputRequired, '->', this.valid);
      this.valid = this.valid && (!this.input.nativeElement.validity || this.input.nativeElement.validity.valid);
      console.log('VALIDITY', this.input.nativeElement.validity, '->', this.valid);
      this.valid = this.valid && (!this.validator || this.validator(value));
      console.log('VALIDATOR', this.validator && this.validator(value), '->', this.valid);
    } else {
      this.valid = !this.validator || this.validator('');
    }
    return this.valid;
  }
}
