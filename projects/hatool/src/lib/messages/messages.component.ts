import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
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

  @HostListener('window:resize', ['$event'])
  resize(e) {
    this.updateScroll();
  }

  updateScroll() {
    setTimeout(() => {
      const el = this.container.nativeElement;
      el.scrollTo({left: 0, top: el.scrollHeight, behavior: 'smooth'});
    }, 0);
  }

  ngOnInit() {
    this.content.updated.subscribe(() => {
      this.updateScroll();
    });
  }

}
