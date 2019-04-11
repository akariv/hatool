import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContentService } from './content.service';

@Injectable({
  providedIn: 'root'
})
export class ScriptRunnerService {

  constructor(private http: HttpClient,
              private content: ContentService) { }

  run(url) {
    this.http.get(url)
        .subscribe((script) => this.processScript(script));
  }

  processScript(script) {
    console.log(script);
  }
}
