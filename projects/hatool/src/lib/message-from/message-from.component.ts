import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'htl-message-from',
  templateUrl: './message-from.component.html',
  styleUrls: ['./message-from.component.less']
})
export class MessageFromComponent implements OnInit {

  @Input() params: any;
  @Input() first: boolean;

  constructor() { }

  ngOnInit() {
  }

}
