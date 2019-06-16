import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContentService } from './content.service';
import { Observable } from 'rxjs';
import { ScriptRunner, CBType, MetaCBType, EventCBType } from './script-runner';

@Injectable({
  providedIn: 'root'
})
export class ScriptRunnerService {

  R: ScriptRunner;

  constructor(private http: HttpClient,
              private content: ContentService) {
    this.R = new ScriptRunner(http, content.M);
  }

  public run(url, index, context, setCallback?: CBType, record?: any,
             metaCallback?: MetaCBType, eventCallback?: EventCBType): Observable<void> {
    return this.R.run(
      url, index, context, setCallback, record,
      metaCallback, eventCallback
    );
  }
}
