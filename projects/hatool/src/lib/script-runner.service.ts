import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContentService } from './content.service';
import { Observable } from 'rxjs';
import { CBType, MetaCBType, EventCBType } from './script-runner-types';
// import { ScriptRunnerBotkit as ScriptRunner } from './script-runner-botkit';
import { ScriptRunnerNew as ScriptRunnerImpl } from './script-runner-new';
import { ScriptRunner } from './script-runner';

@Injectable({
  providedIn: 'root'
})
export class ScriptRunnerService implements ScriptRunner {

  R: ScriptRunner;

  constructor(private http: HttpClient,
              private content: ContentService,
              @Inject(LOCALE_ID) private locale) {
    this.R = new ScriptRunnerImpl(http, content.M, this.locale);
  }

  public run(url, index, context, setCallback?: CBType, record?: any,
             metaCallback?: MetaCBType, eventCallback?: EventCBType): Observable<void> {
    return this.R.run(
      url, index, context, setCallback, record,
      metaCallback, eventCallback
    );
  }
}
