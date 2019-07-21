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
  @ViewChild('input') input: ElementRef;

  value = null;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    window.setTimeout(() => {
      if (this.input) {
        const el: HTMLElement = this.input.nativeElement;
        if (el) {
          console.log('INPUT IS', el.tagName);
          el.focus();
        }
      } else {
        console.log('NULL input');
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
}
