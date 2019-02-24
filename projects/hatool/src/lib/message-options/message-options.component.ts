import { Component, OnInit, Input } from '@angular/core';
import { ContentService } from '../content.service';

@Component({
  selector: 'htl-message-options',
  templateUrl: './message-options.component.html',
  styleUrls: ['./message-options.component.less']
})
export class MessageOptionsComponent implements OnInit {

  @Input() params: any[];
  enabled = true;
  selected = null;

  constructor(private content: ContentService) { }

  ngOnInit() {
  }

  onSubmit(value) {
    this.enabled = false;
    this.selected = value;
    this.content.reportValue(value);
  }
}
