import { NgModule } from '@angular/core';
import { HatoolLibComponent } from './hatool.component';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { MessagesComponent } from './messages/messages.component';
import { InputComponent } from './input/input.component';
import { MessageFromComponent } from './message-from/message-from.component';
import { MessageToComponent } from './message-to/message-to.component';
import { MessageTypingComponent } from './message-typing/message-typing.component';
import { MessageOptionsComponent } from './message-options/message-options.component';
import { BrowserModule } from '@angular/platform-browser';
import { MessageUploaderComponent } from './message-uploader/message-uploader.component';
import { HttpClientModule } from '@angular/common/http';
import { MessageMultiOptionsComponent } from './message-multi-options/message-multi-options.component';
import { MessageCustomComponentComponent } from './message-custom-component/message-custom-component.component';
import { MessageCustomComponentAuxDirective } from './message-custom-component-aux.directive';
import { MessageSwitchComponent } from './message-switch/message-switch.component';

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
    MessageUploaderComponent,
    MessageMultiOptionsComponent,
    MessageCustomComponentComponent,
    MessageCustomComponentAuxDirective,
    MessageSwitchComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  exports: [HatoolLibComponent]
})
export class HatoolLibModule { }
