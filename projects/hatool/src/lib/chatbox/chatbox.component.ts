import { Component, OnInit, Input } from '@angular/core';
import { ContentManager } from '../content-manager';

@Component({
  selector: 'htl-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.less']
})
export class ChatboxComponent implements OnInit {

  @Input() content: ContentManager;

  constructor() { }

  ngOnInit() {
  }

}
