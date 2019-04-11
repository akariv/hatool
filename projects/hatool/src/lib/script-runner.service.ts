import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContentService } from './content.service';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface Step {
  text: string[];
  quick_replies: {
    title: string,
    payload: string
  }[];
  collect: {
    key: string,
    multiple: boolean;
    options: {
      default: boolean,
      type: string,
      pattern: string,
      action: string
    }[]
  };
  action: string;
}

type CBType = (string, any) => void;

@Injectable({
  providedIn: 'root'
})
export class ScriptRunnerService {

  threads = {};
  record: any;
  context = {};
  callback: CBType = null;

  constructor(private http: HttpClient,
              private content: ContentService) { }

  run(url,
      index,
      context,
      setCallback?: CBType,
      record?: any
    ): Observable<void> {
    this.context = context;
    this.callback = setCallback;
    this.record = record || {};
    return this.http.get(url)
        .pipe(
          switchMap((script: any[]) => this.processScriptFile(script, index))
        );
  }

  async processScriptFile(script: any[], index) {
    const threads = script[index || 0].script;
    for (const thread of threads) {
      this.threads[thread.topic] = thread;
    }
    await this.runThread('default');
  }

  async runThread(topic) {
    console.log('> THREAD', topic);
    const thread = this.threads[topic];
    for (const step of thread.script) {
      await this.executeStep(step);
    }
    console.log('< THREAD', topic);
  }

  async executeStep(step: Step) {
    console.log('STEP', step);
    let value = null;
    const key = step.collect && step.collect.key;
    if (step.text) {
      const generic_text = step.text.slice();
      for (const message of generic_text) {
        const commandMatcher = RegExp('^cmd\\.([a-zA-Z_]+)\\(([a-z, ]*)\\)$');
        const commandMatch = message.match(commandMatcher);
        if (commandMatch) {
          const command = commandMatch[1];
          const parsedArgs = commandMatch[2].split(RegExp('[, ]+'));
          const args = [];
          for (const arg of parsedArgs) {
            if (arg === 'record') {
              args.push(this.record);
            } else if (arg === 'context') {
              args.push(this.context);
            } else if (arg === 'key') {
              args.push(key);
            } else if (arg === 'uploader') {
              args.push(await this.content.addUploader(null));
            }
          }
          value = this.context[command](...args);
          if (value instanceof Promise) {
            value = await value;
          }
        } else {
          this.content.addTo(this.fillIn(message));
        }
      }
      if (!value) {
        if (step.quick_replies) {
          this.content.addOptions(
            null,
            step.quick_replies.map((q) => <any>{
              display: q.title,
              value: q.payload
            }, step.quick_replies)
          );
          value = await this.content.waitForInput();
        } else if (step.collect) {
          if (step.collect.multiple) {
            this.content.setTextArea();
          }
          value = await this.content.waitForInput();
        }
      }
    }
    if (value !== null && step.collect) {
      if (key) {
        this.record[key] = value;
        if (this.callback) {
          this.callback(key, value);
        }
      }
      let acted = false;
      for (const option of step.collect.options) {
        if (option.type === 'string') {
          if (option.pattern === value) {
            await this.executeAction(option.action);
            acted = true;
            break;
          }
        } else if (option.type === 'regex') {
          console.log('MATCHING', value, option.pattern, value.match(RegExp(option.pattern)));
          if (value.match(RegExp(option.pattern))) {
            await this.executeAction(option.action);
            acted = true;
            break;
          }
        }
      }
      if (!acted) {
        for (const option of step.collect.options) {
          if (option.default) {
            await this.executeAction(option.action);
            break;
          }
        }
      }
    }
    if (step.action) {
      await this.executeAction(step.action);
    }
  }

  async executeAction(action) {
    if (action === 'next') {
      return;
    }
    if (action === 'complete') {
      return;
    }
    if (this.threads[action]) {
      await this.runThread(action);
    }
  }

  fillIn(message: string) {
    return message.replace(
      RegExp('({{([a-z_0-9]+)}})', 'g'),
      (match, p1, p2) => {
        return this.record[p2] || p2;
      }
    );
  }
}
