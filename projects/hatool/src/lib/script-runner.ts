import { CBType, EventCBType } from './script-runner-types';
import { Observable } from 'rxjs';

export interface ScriptRunner {
    run(url,
        index,
        context,
        setCallback?: CBType,
        record?: any,
        eventCallback?: EventCBType,
      ): Observable<any>;
}
