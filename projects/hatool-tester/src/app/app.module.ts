import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HatoolLibModule } from 'hatool';

import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
 
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HatoolLibModule,
    HighlightModule
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          typescript: () => import('highlight.js/lib/languages/typescript'),
          less: () => import('highlight.js/lib/languages/less'),
        }
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
