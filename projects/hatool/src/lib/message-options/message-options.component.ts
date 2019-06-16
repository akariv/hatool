import { Component, OnInit, Input } from '@angular/core';
import { ContentService } from '../content.service';
import { ContentManager } from '../content-manager';

@Component({
  selector: 'htl-message-options',
  templateUrl: './message-options.component.html',
  styleUrls: ['./message-options.component.less']
})
export class MessageOptionsComponent implements OnInit {

  @Input() params: any[];
  @Input() content: ContentManager;

  enabled = true;
  selected = null;

  constructor() { }

  ngOnInit() {
  }

  onSubmit(value) {
    this.enabled = false;
    this.selected = value;
    this.content.reportValue(value);
  }
}
