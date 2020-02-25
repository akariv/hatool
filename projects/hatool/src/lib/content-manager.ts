import { Subject } from 'rxjs';
import { first as first_ } from 'rxjs/operators';

export class ContentManager {

  public messages: any[] = [];
  public inputs = new Subject<any>();
  public updated = new Subject<any>();
  public inputEnabled = false;
  public textArea = false;
  public placeholder = '';
  public validator = null;
  public debug = false;

  public sendButtonText = 'Send';
  public inputPlaceholder = 'Type something...';
  public uploadFileText = 'Upload File...';
  public uploadedFileText = 'Uploaded Successfully';
  public notUploadedFileText = 'Failed to upload file';
  public timeout = 1000;

  toQueue = [];

  constructor() { }

  clear() {
    this.messages = [];
    this.toQueue = [];
  }

  reportValue(value) {
    this.inputs.next(value);
  }

  reportUpdated(value) {
    if (this.timeout) {
      // A bit of a hack to prevent the messages component to scroll during replay
      window.setTimeout(() => {
        this.updated.next(value);
      }, this.timeout / 10);
    }
  }

  add(kind, params) {
    const first = (
      this.messages.length === 0 ||
      kind !== this.messages[this.messages.length - 1].kind
    );
    this.messages.push({kind, params, first});
  }

  queue(kind, params) {
    this.toQueue.push({kind, params});
    if (this.toQueue.length === 1) {
      this.typing();
    }
  }

  queueFunction(callable) {
    return new Promise((resolve) => {
      this.queue('function', {callable, resolve});
    });
  }

  typing() {
    if (this.debug) {
      console.log('TYPING, queue len=' + this.toQueue.length);
    }
    if (this.toQueue.length > 0) {
      const item = this.toQueue[0];
      if (this.debug) {
        console.log('item=' + JSON.stringify(item));
      }
      if (item.kind === 'function') {
        this.toQueue.shift();
        const future = item.params.callable();
        future.then((result) => {
          item.params.resolve(result);
          this.typing();
        });
      } else {
        this.add('typing', null);
        window.setTimeout(async () => {
          this.toQueue.shift();
          if (this.debug) {
            console.log('handling item=' + JSON.stringify(item));
          }
          this.replace(item.kind, item.params);
          if (item.params && item.params.meta) {
            item.params.meta();
          }
          this.reportUpdated(item);
          this.typing();
        }, this.timeout);
      }
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
    this.textArea = false;
    this.placeholder = '';
    this.validator = null;
  }

  queueFrom(message: string) {
    this.queue('from', {message});
  }

  addTo(message: string, meta?: () => void) {
    this.queue('to', {message, meta});
  }

  addOptions(message, options: any[], selected?: any) {
    if (message) {
      this.queue('to', {message});
    }
    this.queue('options', {options, selected});
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

  setPlaceholder(placeholder) {
    this.placeholder = placeholder;
  }

  setValidator(validator) {
    this.validator = validator;
  }

  async waitForInput(enableTextInput?) {
    enableTextInput = (enableTextInput !== false);
    if (enableTextInput) {
      await this.queueFunction(async () => {
        if (this.debug) {
          console.log('ENABLING INPUT');
        }
        this.inputEnabled = true;
      });
    }
    const ret = await new Promise((resolve) => {
      this.inputs.pipe(
        first_()
      ).subscribe((value) => {
        if (this.debug) {
          console.log('DISABLING INPUT, value=', value);
        }
        this.inputEnabled = false;
        resolve(value);
      });
    });
    return ret;
  }

  setQueueTimeout(timeout) {
    this.timeout = timeout;
  }

}
