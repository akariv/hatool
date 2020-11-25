import { Subject } from 'rxjs';
import { first as first_ } from 'rxjs/operators';
import { Waitable } from './interfaces';

export class ContentManager {

  public messages: any[] = [];
  private provisionalMessages: any[] = [];
  private currentMessages = this.messages;

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
    this.provisionalMessages = [];
    this.currentMessages = this.messages;
    this.toQueue = [];
  }

  reportValue(value) {
    this.inputs.next(value);
  }

  reportUpdated(value) {
    if (this.timeout) {
      window.setTimeout(() => {
        this.updated.next(value);
      }, this.timeout);
    }
  }

  add(kind, params) {
    const first = (
      this.currentMessages.length === 0 ||
      kind !== this.currentMessages[this.currentMessages.length - 1].kind
    );
    this.currentMessages.push({kind, params, first});
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
        console.log('item=',item);
      }
      if (item.kind === 'function') {
        console.log('RUNNING FUNCTION', item);
        this.toQueue.shift();
        const future = item.params.callable();
        future.then((result) => {
          console.log('FUNCTION RESOLVED to', result, item);
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
          if (item.params && item.params.meta) {
            item.params.meta();
          }
          this.typing();
        }
        if (this.timeout === 0) {
          callback();
        } else {
          window.setTimeout(() => { 
            callback();
            this.reportUpdated(item);
          }, this.timeout);
        }
      }
    } else {
      window.setTimeout(async () => {
        this.reportUpdated(null);
      }, this.timeout);
    }
  }

  replace(kind, params) {
    const first = (this.currentMessages.length < 2 || kind !== this.currentMessages[this.currentMessages.length - 2].kind);
    this.currentMessages[this.currentMessages.length - 1] = {kind, params, first};
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

  queueFrom(message: string) {
    this.queue('from', {message, fixme: this.fixme, fixmeMessage: this.fixmeMessage});
  }

  addTo(message: string, meta?: () => void) {
    this.queue('to', {message, meta});
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

  addCustomComponent(step) {
    return new Promise((componentCreatedCallback) => {
      this.queue('component', {
        step: step,
        componentCreatedCallback: () => { 
          if (this.debug) {
            console.log('CUSTOM COMPONENT CREATED', step);
          }
          return componentCreatedCallback(); 
        }
      });
    }).then(() => {
      return this.queueFunction(() => {
        return (step.__instance as Waitable).wait();
      }); 
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
        this.provisionalMessages = [...this.messages];
        this.currentMessages = this.provisionalMessages;
      } else {
        this.messages = [...this.provisionalMessages];
        this.currentMessages = this.messages;
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
