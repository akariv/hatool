import { Component, OnInit, Input } from '@angular/core';
import { ContentService } from '../content.service';
import { ContentManager } from '../content-manager';

@Component({
  selector: 'htl-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.less']
})
export class InputComponent implements OnInit {

  @Input() content: ContentManager;

  value = null;

  constructor() { }

  ngOnInit() {
  }

  onChange(event) {
    this.value = event.target.value;
    event.target.value = '';
  }

  onSubmit(event) {
    if (event) {
      this.value = event.target.value;
      event.target.value = '';
    }
    const parts = this.value.split('\n');
    for (const part of parts) {
      if (part.length > 0) {
        this.content.addFrom(part);
      }
    }
  }
}
