import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HatoolLibModule } from 'hatool-lib';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HatoolLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
