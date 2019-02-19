import { Component, OnInit, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { ContentService } from '../content.service';

@Component({
  selector: 'htl-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.less']
})
export class MessagesComponent implements OnInit {

  @ViewChild('container') container: ElementRef;

  constructor(public content: ContentService) {
    content.updated.subscribe(() => {
      const el = this.container.nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }

  ngOnInit() {
  }

}
