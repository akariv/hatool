import { Component, OnInit, Input } from '@angular/core';
import { ContentManager } from '../content-manager';

@Component({
  selector: 'htl-message-to',
  templateUrl: './message-to.component.html',
  styleUrls: ['./message-to.component.less']
})
export class MessageToComponent implements OnInit {

  @Input() params: any;
  @Input() first: boolean;
  @Input() content: ContentManager;

  constructor() { }

  ngOnInit() {
  }

}
