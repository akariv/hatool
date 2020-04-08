import { Component, OnInit, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { ContentService } from '../content.service';
import { ContentManager } from '../content-manager';

@Component({
  selector: 'htl-message-options',
  templateUrl: './message-options.component.html',
  styleUrls: ['./message-options.component.less']
})
export class MessageOptionsComponent implements OnInit, AfterViewInit {

  @Input() params: any;
  @Input() content: ContentManager;
  @Output() appeared = new EventEmitter<void>();

  active = false;
  enabled = true;
  selected = null;
  isSelected = false;
  private selectedJson: string;

  constructor() { }

  ngOnInit() {
    if (this.params.selected !== null && this.params.selected !== undefined) {
      this.selected = this.params.selected;
      this.isSelected = true;
    }
    this.selectedJson = JSON.stringify(this.selected);
  }

  get multi() {
    return !!this.params.multi;
  }

  equalsSelected(value) {
    return JSON.stringify(value) === this.selectedJson;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.active = true;
      this.appeared.emit();
    }, 0);
  }

  onSubmit(value) {
    this.enabled = false;
    this.selected = value;
    this.isSelected = true;
    this.selectedJson = JSON.stringify(this.selected);
    this.content.reportValue(value);
  }
}
