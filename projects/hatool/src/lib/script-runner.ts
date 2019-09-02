import { CBType, MetaCBType, EventCBType } from './script-runner-types';
import { Observable } from 'rxjs';

export interface ScriptRunner {
    run(url,
        index,
        context,
        setCallback?: CBType,
        record?: any,
        metaCallback?: MetaCBType,
        eventCallback?: EventCBType,
      ): Observable<void>;
}
