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

  active = false;
  enabled = true;
  selected = false;
  checked = false;
  value = null;

  constructor() { }

  ngOnInit() {
    this.value = this.params.selected || {};
    this.selected = !!this.params.selected;
    this.checkChecked();
  }

  get multi() {
    return !!this.params.multi;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.active = true;
      this.content.reportUpdated(null);
    }, 0);
  }

  toggle(field) {
    this.value[field] = !this.value[field];
    this.checkChecked();
  }

  onSubmit() {
    this.enabled = false;
    this.selected = true;
    this.content.reportValue(this.value);
  }

  checkChecked() {
    this.checked = Object.values(this.value).indexOf(true) >= 0;
  }
}
