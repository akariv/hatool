import { Component, OnInit, Input } from '@angular/core';
import { ContentManager } from '../content-manager';

@Component({
  selector: 'htl-message-from',
  templateUrl: './message-from.component.html',
  styleUrls: ['./message-from.component.less']
})
export class MessageFromComponent implements OnInit {

  @Input() params: any;
  @Input() first: boolean;
  @Input() content: ContentManager;

  constructor() { }

  ngOnInit() {
  }

}
