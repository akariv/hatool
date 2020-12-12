import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ContentManager, ScriptRunnerImpl } from 'hatool';
import { map } from 'rxjs/operators';
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
        get_chuck: async () => {
          return this.http.get('https://api.chucknorris.io/jokes/random/').pipe(
            map((joke: any) => joke.value),
          ).toPromise();
        }
      },
      (key, value) => { console.log('SETTING', key, '<==', value); },
      {},
    ).subscribe(() => { console.log('done!'); });
  }

}
