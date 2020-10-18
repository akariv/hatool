import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ContentService, ScriptRunnerService, ScriptRunnerNew } from 'hatool';
import hljs from 'highlight.js/lib/highlight';
import { HttpClient } from '@angular/common/http';
import { doIt } from './chatLogic';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'hatool';

  code = '';
  style = '';

  constructor(private runner: ScriptRunnerService,
              private http: HttpClient) {}

  ngOnInit() {
    this.http.get('https://raw.githubusercontent.com/akariv/hatool/master/projects/hatool-tester/src/app/chatLogic.ts',
                  {responseType: 'text'})
        .subscribe((content) => {
          this.code = content;
        });
    this.http.get('https://raw.githubusercontent.com/akariv/hatool/master/projects/hatool-tester/src/theme.less',
                  {responseType: 'text'})
        .subscribe((content) => {
          this.style = content;
        });
    (<ScriptRunnerNew>this.runner.R).debug = true;
    this.runner.run(
      'assets/script.json', 0,
      {
        isWorkingTime: (rec) => 'true',
        FilesUploadedCount: () => '5',
      },
      (key, value) => { console.log('SETTING', key, '<==', value); },
      {},
      (meta) => { console.log('GOT META', meta); }
    ).subscribe(() => { console.log('done!'); });
    // doIt(this.content.M);
  }

}
