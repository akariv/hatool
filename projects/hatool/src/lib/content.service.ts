import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { first as first_ } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  public messages: any[] = [];
  public inputs = new Subject<any>();
  public updated = new Subject<any>();
  public inputEnabled = false;
  public textArea = false;

  public sendButtonText = 'Send';
  public inputPlaceholder = 'Type something...';
  public uploadFileText = 'Upload File...';
  public uploadedFileText = 'Uploaded Successfully';
  public notUploadedFileText = 'Failed to upload file';

  toQueue = [];

  constructor() { }

  reportValue(value) {
    this.inputs.next(value);
  }

  reportUpdated(value) {
    window.setTimeout(() => {
      this.updated.next(value);
    }, 100);
  }

  add(kind, params) {
    const first = (
      this.messages.length === 0 ||
      kind !== this.messages[this.messages.length - 1].kind
    );
    this.messages.push({kind, params, first});
  }

  queue(kind, params, inputEnabled?) {
    this.toQueue.push({kind, params, inputEnabled});
    if (this.toQueue.length === 1) {
      this.typing();
    }
  }

  typing() {
    if (this.toQueue.length > 0) {
      this.add('typing', null);
      window.setTimeout(() => {
        const item = this.toQueue.shift();
        this.replace(item.kind, item.params);
        if (this.toQueue.length === 0) {
          this.inputEnabled = item.inputEnabled;
        }
        this.reportUpdated(item);
        this.typing();
      }, 1000);
      }
  }

  replace(kind, params) {
    const first = (this.messages.length < 2 || kind !== this.messages[this.messages.length - 2].kind);
    this.messages[this.messages.length - 1] = {kind, params, first};
  }

  addFrom(message: string) {
    this.add('from', {message});
    this.reportValue(message);
    this.reportUpdated(message);
    this.inputEnabled = false;
    this.textArea = false;
  }

  addTo(message: string) {
    this.queue('to', {message}, true);
  }

  addOptions(message, options: any[]) {
    if (message) {
      this.queue('to', {message});
    }
    this.queue('options', options);
  }

  addUploader(message, options?: any) {
    if (message) {
      this.queue('to', {message});
    }
    this.queue('uploader', options);
  }

  setTextArea() {
    this.textArea = true;
  }

  waitForInput(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.inputs.pipe(
        first_()
      ).subscribe((value) => {
        resolve(value);
      });
    });
  }

}
