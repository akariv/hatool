import { Component, OnInit, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { ContentService } from '../content.service';
import { ContentManager } from '../content-manager';

@Component({
  selector: 'htl-message-multi-options',
  templateUrl: './message-multi-options.component.html',
  styleUrls: ['./message-multi-options.component.less']
})
export class MessageMultiOptionsComponent implements OnInit, AfterViewInit {

  @Input() params: any;
  @Input() content: ContentManager;
  @Output() appeared = new EventEmitter<void>();

  active = false;
  enabled = true;
  selected = false;
  value = null;

  constructor() { }

  ngOnInit() {
    this.value = this.params.selected || {};
  }

  get multi() {
    return !!this.params.multi;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.active = true;
      this.appeared.emit();
    }, 0);
  }

  toggle(field) {
    this.value[field] = !this.value[field];
  }

  onSubmit() {
    this.enabled = false;
    this.selected = true;
    this.content.reportValue(this.value);
  }
}
