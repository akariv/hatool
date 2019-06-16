import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { first as first_ } from 'rxjs/operators';
import { ContentManager } from './content-manager';

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  public M = new ContentManager();

}
