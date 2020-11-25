import { Component, Input, OnInit } from '@angular/core';
import { ContentManager } from '../content-manager';

@Component({
  selector: 'htl-message-switch',
  templateUrl: './message-switch.component.html',
  styleUrls: ['./message-switch.component.less']
})
export class MessageSwitchComponent implements OnInit {

  @Input() content: ContentManager;
  @Input() item: any;

  constructor() { }

  ngOnInit(): void {
  }

}
