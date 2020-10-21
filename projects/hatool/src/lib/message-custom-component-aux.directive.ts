import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[htlMessageCustomComponentAux]'
})
export class MessageCustomComponentAuxDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
