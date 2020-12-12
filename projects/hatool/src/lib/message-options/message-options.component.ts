import { Component, OnInit, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { ContentService } from '../content.service';
import { ContentManager } from '../content-manager';
import { defer, from, Observable } from 'rxjs';

@Component({
  selector: 'htl-message-options',
  templateUrl: './message-options.component.html',
  styleUrls: ['./message-options.component.less']
})
export class MessageOptionsComponent implements OnInit, AfterViewInit {

  @Input() params: any;
  @Input() content: ContentManager;

  active = false;
  enabled = true;
  selected = null;
  isSelected = false;
  echoSelected = false;
  private selectedJson: string;

  constructor() { }

  ngOnInit() {
    if (this.params.selected !== null && this.params.selected !== undefined) {
      this.selected = this.params.selected;
      this.isSelected = true;
    }
    this.selectedJson = JSON.stringify(this.selected);
  }

  get multi() {
    return !!this.params.multi;
  }

  equalsSelected(value) {
    return JSON.stringify(value) === this.selectedJson;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.active = true;
    }, 0);
  }

  onSubmit(selected) {
    const value = selected.value;
    let obs: Observable<any> = null;
    if (selected.func) {
      obs = defer(selected.func);
    } else {
      obs = from([value]);
    }
    obs.subscribe((retVal) => {
      if (retVal !== null) {
        this.enabled = false;
        this.selected = retVal;
        this.isSelected = true;
        this.echoSelected  = selected.echo;
        this.selectedJson = JSON.stringify(this.selected);
        this.content.reportValue(this.selected);
      }
    });
  }
}
