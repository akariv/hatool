import { Subject } from 'rxjs';
import { first as first_, tap, timestamp } from 'rxjs/operators';
import { Waitable } from './interfaces';

export class ContentManager {

  public messages: any[] = [];
  public revision = 0;
  public visibleRevision = 0;

  public inputs = new Subject<any>();
  public updated = new Subject<any>();
  public inputEnabled = false;
  public textArea = false;
  public inputKind = 'text';
  public inputMin;
  public inputMax;
  public inputStep;
  public inputSuggestions;
  public inputRequired;
  public placeholder = '';
  public validator = null;
  public fastScroll = false;
  public scrollLock = false;
  public fixme: () => void = null;
  public debug = false;

  public sendButtonText = 'Send';
  public inputPlaceholder = 'Type something...';
  public uploadFileText = 'Upload File...';
  public uploadedFileText = 'Uploaded Successfully';
  public notUploadedFileText = 'Failed to upload file';
  public fixmeMessage = 'Fix';
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
    if (this.debug) {
      console.log('CONTENT UPDATED', this.timeout);
    }
    if (this.timeout) {
      window.setTimeout(() => {
        this.updated.next(value);
      }, this.timeout);
    }
  }

  add(kind, params) {
    const first = (
      this.messages.length === 0 ||
      kind !== this.messages[this.messages.length - 1].kind
    );
    const revision = this.revision;
    this.messages.push({kind, params, first, revision});
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
        console.log('item=', item);
      }
      if (item.kind === 'function') {
        if (this.debug) {
          console.log('RUNNING FUNCTION', item);
        }
        this.toQueue.shift();
        const future = item.params.callable();
        future.then((result) => {
          if (this.debug) {
            console.log('FUNCTION RESOLVED to', result, item);
          }
          item.params.resolve(result);
          this.typing();
        });
      } else {
        this.add('typing', null);
        const callback = () => {
          this.toQueue.shift();
          if (this.debug) {
            console.log('handling item=', item);
          }
          this.replace(item.kind, item.params);
          this.typing();
        };
        let timeout = this.timeout;
        if (this.toQueue.length > 0) {
          let stepTimeout = this.toQueue[0].params.timeout;
          if (stepTimeout || stepTimeout === 0) {
            timeout = stepTimeout;
          }
        }
        if (timeout === 0) {
          callback();
        } else {
          window.setTimeout(() => {
            callback();
            this.reportUpdated(item);
          }, timeout);
        }
      }
    } else {
      window.setTimeout(async () => {
        this.reportUpdated(null);
      }, this.timeout);
    }
  }

  replace(kind, params) {
    const first = (this.messages.length < 2 || kind !== this.messages[this.messages.length - 2].kind);
    this.messages[this.messages.length - 1] = {kind, params, first};
  }

  addFrom(message: string) {
    this.add('from', {message, fixme: this.fixme, fixmeMessage: this.fixmeMessage});
    this.reportValue(message);
    this.reportUpdated(message);
    this.textArea = false;
    this.placeholder = '';
    this.validator = null;
    this.fixme = null;
  }

  queueFrom(message: string, timeout?) {
    this.queue('from', {message, fixme: this.fixme, fixmeMessage: this.fixmeMessage, timeout});
  }

  addTo(message: string, timeout?) {
    this.queue('to', {message, timeout});
  }

  addOptions(message, options: any[], selected?: any, multi?: boolean) {
    if (message) {
      this.queue('to', {message});
    }
    this.queue('options', {options, selected, multi, fixme: this.fixme, fixmeMessage: this.fixmeMessage});
  }

  addUploader(message, options?: any) {
    if (message) {
      this.queue('to', {message});
    }
    this.queue('uploader', options);
  }

  addCustomComponent(step, wait, timeout?) {
    return new Promise<void>((componentCreatedCallback) => {
      this.queue('component', {
        step,
        timeout,
        componentCreatedCallback: () => {
          if (this.debug) {
            console.log('CUSTOM COMPONENT CREATED', step);
          }
          return componentCreatedCallback();
        }
      });
    }).then(() => {
      if (wait) {
        return this.queueFunction(() => {
          return (step.__instance as Waitable).wait();
        });
      } else {
        return;
      }
    });
  }

  setTextArea() {
    this.textArea = true;
  }

  setInputKind(kind, required?, min?, max?, step?) {
    this.inputKind = kind || 'text';
    this.inputRequired = !!required,
    this.inputMin = min === undefined ? null : min;
    this.inputMax = max === undefined ? null : max;
    this.inputStep = step === undefined ? null : step;
  }

  setInputSuggestions(suggestions: string[]) {
    this.inputSuggestions = suggestions;
  }

  setPlaceholder(placeholder) {
    this.placeholder = placeholder;
  }

  setValidator(validator) {
    this.validator = validator;
  }

  setFixme(fixme: () => void) {
    this.fixme = fixme;
  }

  setFastScroll(value: boolean) {
    this.fastScroll = value;
  }

  setScrollLock(value: boolean) {
    if (this.scrollLock !== value) {
      this.scrollLock = value;
      if (value) {
        this.revision += 1;
      } else {
        this.visibleRevision = this.revision;
        if (this.debug) {
          console.log('SETTING VISIBLE REVISION', this.visibleRevision, 'LAST MESSAGE', this.messages[this.messages.length - 1]);
        }
      }
    }
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
    return this.inputs.pipe(
        first_(),
        tap((value) => {
          if (this.debug) {
            console.log('DISABLING INPUT, value=', value);
          }
          this.inputEnabled = false;
        })
      ).toPromise();
  }

  setQueueTimeout(timeout) {
    let report = false;
    if (this.timeout === 0 && timeout !== 0) {
      report = true;
    }
    this.timeout = timeout;
    if (report) {
      this.reportUpdated(null);
    }
  }

}
