import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
import { ContentService } from '../content.service';
import { ContentManager } from '../content-manager';
import { Subscription } from 'rxjs';

@Component({
  selector: 'htl-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.less']
})
export class MessagesComponent implements OnInit, OnChanges {

  @ViewChild('container', { static: true }) container: ElementRef;
  @Input() content: ContentManager;

  updatedSub: Subscription;

  constructor() {
  }

  @HostListener('window:resize', ['$event'])
  resize(e) {
    this.updateScroll();
  }

  updateScroll() {
    setTimeout(() => {
      const el: HTMLElement = this.container.nativeElement;
      if (this.content.debug) {
        console.log('SCROLLING TO BOTTOM');
      }
      el.scrollTo({left: 0, top: el.scrollHeight, behavior: this.content.fastScroll ? 'auto' : 'smooth' });
    }, 0);
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.updatedSub) {
      this.updatedSub.unsubscribe();
    }
    this.updatedSub = this.content.updated.subscribe(() => {
      this.updateScroll();
    });
  }
}
