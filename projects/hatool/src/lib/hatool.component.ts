import { Component, OnInit, Input } from '@angular/core';
import { ContentService } from './content.service';
import { ContentManager } from './content-manager';

@Component({
  selector: 'htl-hatool',
  template: `
      <htl-chatbox [content]='content'></htl-chatbox>
  `,
  styleUrls: ['./hatool.component.less']
})
export class HatoolLibComponent implements OnInit {

  @Input() content: ContentManager;

  constructor(private contentService: ContentService) { }

  ngOnInit() {
    this.content = this.content ? this.content : this.contentService.M;
  }

}
