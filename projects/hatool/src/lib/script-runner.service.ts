import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContentService } from './content.service';
import { Observable } from 'rxjs';
import { CBType, EventCBType } from './script-runner-types';
import { ScriptRunnerImpl } from './script-runner-impl';
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
             eventCallback?: EventCBType): Observable<void> {
    return this.R.run(
      url, index, context, setCallback, record,
      eventCallback
    );
  }
}
