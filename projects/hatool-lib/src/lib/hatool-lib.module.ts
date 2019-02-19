import { NgModule } from '@angular/core';
import { HatoolLibComponent } from './hatool-lib.component';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { MessagesComponent } from './messages/messages.component';
import { InputComponent } from './input/input.component';
import { MessageFromComponent } from './message-from/message-from.component';
import { MessageToComponent } from './message-to/message-to.component';
import { MessageTypingComponent } from './message-typing/message-typing.component';
import { MessageOptionsComponent } from './message-options/message-options.component';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    HatoolLibComponent,
    ChatboxComponent,
    MessagesComponent,
    InputComponent,
    MessageFromComponent,
    MessageToComponent,
    MessageTypingComponent,
    MessageOptionsComponent,
  ],
  imports: [
    BrowserModule
  ],
  exports: [HatoolLibComponent]
})
export class HatoolLibModule { }
