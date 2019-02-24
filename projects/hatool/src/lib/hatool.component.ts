import { Component, OnInit } from '@angular/core';
import { ContentService } from './content.service';

@Component({
  selector: 'htl-hatool',
  template: `
      <htl-chatbox></htl-chatbox>
  `,
  styleUrls: ['./hatool.component.less']
})
export class HatoolLibComponent implements OnInit {

  constructor(private content: ContentService) { }

  ngOnInit() {
  }

}
