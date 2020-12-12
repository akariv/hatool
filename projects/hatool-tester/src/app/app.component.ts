import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {  ScriptRunnerService, ScriptRunnerImpl } from 'hatool';
import { HttpClient } from '@angular/common/http';
import { MessageImageComponent} from './message-image/message-image.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'hatool';

  code = '';
  style = '';
  script = '';

  constructor(private runner: ScriptRunnerService,
              private http: HttpClient) {}

  ngOnInit(): void {
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
    this.http.get('https://raw.githubusercontent.com/akariv/hatool/master/projects/hatool-tester/src/assets/script.yaml',
                  {responseType: 'text'})
        .subscribe((content) => {
          this.script = content;
        });
    const runner: ScriptRunnerImpl = this.runner.R as ScriptRunnerImpl;
    runner.registerCustomComponents([
      {
        keyword: 'img',
        cls: MessageImageComponent
      }
    ]);
    runner.debug = true;
    runner.run(
      'assets/script.json', 0,
      {
        isWorkingTime: (rec) => 'true',
        FilesUploadedCount: () => '5',
      },
      (key, value) => { console.log('SETTING', key, '<==', value); },
      {},
    ).subscribe(() => { console.log('done!'); });
  }

}
