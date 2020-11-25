import { Component, ComponentFactoryResolver, Input, OnInit, ViewChild } from '@angular/core';
import { ContentManager } from '../content-manager';
import { MessageCustomComponentAuxDirective } from '../message-custom-component-aux.directive';

@Component({
  selector: 'htl-message-custom-component',
  templateUrl: './message-custom-component.component.html',
  styleUrls: ['./message-custom-component.component.less']
})
export class MessageCustomComponentComponent implements OnInit {

  @Input() content: ContentManager;
  @Input() params: any;

  @ViewChild(MessageCustomComponentAuxDirective, { static: true }) inner: MessageCustomComponentAuxDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.params.step.__component.cls);

    const viewContainerRef = this.inner.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent<any>(componentFactory);
    componentRef.instance.content = this.content;
    componentRef.instance.params = this.params.step;
    this.params.step.__instance = componentRef.instance;
    this.params.componentCreatedCallback();
  }

}
