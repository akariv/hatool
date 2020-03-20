import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input } from '@angular/core';
import { ContentService } from '../content.service';
import { ContentManager } from '../content-manager';

@Component({
  selector: 'htl-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.less']
})
export class MessagesComponent implements OnInit {

  @ViewChild('container') container: ElementRef;
  @Input() content: ContentManager;

  constructor() {
  }

  ngOnInit() {
    this.content.updated.subscribe(() => {
      setTimeout(() => {
        const el = this.container.nativeElement;
        el.scrollTop = el.scrollHeight;
      }, 0);
    });
  }

}
