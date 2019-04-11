import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ContentService, ScriptRunnerService } from 'hatool';
import hljs from 'highlight.js/lib/highlight';
import typescript from 'highlight.js/lib/languages/typescript';
import less from 'highlight.js/lib/languages/less';
import { HttpClient } from '@angular/common/http';
import { doIt } from './chatLogic';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'hatool';

  @ViewChild('code') code: ElementRef;
  @ViewChild('style') style: ElementRef;

  constructor(private runner: ScriptRunnerService,
              private http: HttpClient) {}

  ngOnInit() {
    this.http.get('https://raw.githubusercontent.com/akariv/hatool/master/projects/hatool-tester/src/app/chatLogic.ts',
                  {responseType: 'text'})
        .subscribe((content) => {
          this.code.nativeElement.innerHTML = content;
          hljs.highlightBlock(this.code.nativeElement);
        });
    this.http.get('https://raw.githubusercontent.com/akariv/hatool/master/projects/hatool-tester/src/theme.less',
                  {responseType: 'text'})
        .subscribe((content) => {
          this.style.nativeElement.innerHTML = content;
          hljs.highlightBlock(this.style.nativeElement);
        });
    hljs.registerLanguage('typescript', typescript);
    hljs.registerLanguage('less', less);
    this.runner.run(
      'https://raw.githubusercontent.com/akariv/hatool/feature/script-runner/scripts/callerscript.json', 0,
      {
        isWorkingTime: (rec) => 'true'
      },
      (key, value) => { console.log('SETTING', key, '<==', value); }
    ).subscribe(() => { console.log('done!'); });
    // doIt(this.content);
  }

}
