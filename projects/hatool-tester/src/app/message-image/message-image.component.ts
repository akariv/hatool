import { Component, Input, OnInit } from '@angular/core';
import { ContentManager } from 'hatool';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-message-image',
  templateUrl: './message-image.component.html',
  styleUrls: ['./message-image.component.less']
})
export class MessageImageComponent implements OnInit {

  @Input() content: ContentManager;
  @Input() params: any;

  clicked = new Subject<void>();

  constructor() { }

  ngOnInit(): void {
  }

  wait() {
    return new Promise((resolve) => {
      this.clicked.pipe(first()).subscribe(() => {
        resolve();
      });
    });
  }

}
