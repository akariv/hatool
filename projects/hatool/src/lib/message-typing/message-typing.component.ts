import { Component, OnInit, Input } from '@angular/core';
import { ContentManager } from '../content-manager';

@Component({
  selector: 'htl-message-typing',
  templateUrl: './message-typing.component.html',
  styleUrls: ['./message-typing.component.less']
})
export class MessageTypingComponent implements OnInit {

  @Input() content: ContentManager;

  constructor() { }

  ngOnInit() {
  }

}
