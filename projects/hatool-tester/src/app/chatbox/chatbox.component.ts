import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ContentManager, ScriptRunnerImpl } from 'hatool';
import { MessageImageComponent } from '../message-image/message-image.component';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.less']
})
export class ChatboxComponent implements OnInit {

  content = new ContentManager();

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const runner = new ScriptRunnerImpl(this.http, this.content, 'en');
    runner.registerCustomComponents([
      {
        keyword: 'img',
        cls: MessageImageComponent
      }
    ]);
    runner.debug = true;
    runner.timeout = 500;
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
