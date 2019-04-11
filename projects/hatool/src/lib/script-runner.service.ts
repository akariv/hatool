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
    options: {
      default: boolean,
      pattern: string,
      action: string
    }[]
  };
}

@Injectable({
  providedIn: 'root'
})
export class ScriptRunnerService {

  threads = {};
  record = {};

  constructor(private http: HttpClient,
              private content: ContentService) { }

  run(url): Observable<void> {
    return this.http.get(url)
        .pipe(
          switchMap((script: any[]) => this.processScriptFile(script))
        );
  }

  async processScriptFile(script: any[]) {
    const threads = script[0].script;
    for (const thread of threads) {
      this.threads[thread.topic] = thread;
    }
    await this.runThread('default');
  }

  async runThread(topic) {
    const thread = this.threads[topic];
    for (const step of thread.script) {
      await this.executeStep(step);
    }
  }

  async executeStep(step: Step) {
    console.log(step);
    let value = null;
    if (step.text) {
      let quick_replies_msg = null;
      if (step.quick_replies) {
        quick_replies_msg = step.text.shift();
      }
      for (const message of step.text) {
        this.content.addTo(this.fillIn(message));
      }
      if (quick_replies_msg) {
        this.content.addOptions(
          quick_replies_msg,
          step.quick_replies.map((q) => <any>{
            display: q.title,
            value: q.payload
          }, step.quick_replies)
        );
        value = await this.content.waitForInput();
      } else if (step.collect) {
        value = await this.content.waitForInput();
      }
    }
    if (value !== null && step.collect) {
      const key = step.collect.key;
      if (key) {
        this.record[key] = value;
      }
      let acted = false;
      for (const option of step.collect.options) {
        if (option.pattern === value) {
          await this.executeAction(option.action);
          acted = true;
          break;
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
  }

  async executeAction(action) {
    if (action === 'next') {
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
