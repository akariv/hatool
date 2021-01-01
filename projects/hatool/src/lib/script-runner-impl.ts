import { CBType } from './script-runner-types';
import { HttpClient } from '@angular/common/http';
import { ContentManager } from './content-manager';
import { ScriptRunner } from './script-runner';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export class ScriptRunnerImpl implements ScriptRunner {
    record = {};
    context = {};
    snippets: any = {};
    setCallback: CBType;
    runFastInternal = false;
    lastMessage = '';
    public debug = false;
    public fixme: () => void = null;

    // return from call and continue
    public RETURN = 0;
    // script has completed
    public COMPLETE = -1;
    // script requested to break and save state
    public BREAK = -2;

    public state = {};

    public TIMEOUT = 1000;


    constructor(private http: HttpClient,
                private content: ContentManager,
                private locale: string,
                private customComponents: any[]= null) {
        console.log('Running with locale', this.locale);
    }

    set timeout(value) {
        this.TIMEOUT = value;
    }

    set runFast(value) {
        this.runFastInternal = value;
        this.content.setScrollLock(value);
        window.setTimeout(() => {
            this.content.setFastScroll(value);
            if (!value) {
                this.content.queueFunction(async () => {
                    this.content.reportUpdated(null);
                });
            }
        }, 0);
    }

    get runFast() {
        return this.runFastInternal;
    }

    registerCustomComponents(customComponents: any[]) {
        this.customComponents = customComponents;
    }

    i18n(obj) {
        if (obj && obj['.tx']) {
            if (this.locale && obj['.tx'][this.locale]) {
                return obj['.tx'][this.locale];
            } else {
                return obj['.tx']._;
            }
        }
        return obj;
    }

    get(obj: any, field) {
        const parts = field.split('.');
        for (const part of parts) {
            obj = obj[part] || {};
        }
        if (obj.constructor !== Object || Object.entries(obj).length > 0) {
            return obj;
        }
        return null;
    }

    getDefault(f) {
        const ret = this.get(this.record, f);
        if (ret) {
            return ret + '';
        } else {
            return f;
        }
    }

    fillIn(message: string) {
        return message.replace(
            RegExp('(\\{\\{((\\p{L}|\\p{N}|_|\\.)+)\\}\\})', 'gum'),
            (match, p1, p2) => {
                return this.getDefault(p2);
            }
        );
    }

    run(urlOrScript: any,
        index: any,
        context: any,
        setCallback?: CBType,
        record?: any): Observable<any> {
        this.context = context;
        this.setCallback = setCallback || ((k, v) => null);
        this.record = record || this.record;
        this.runFast = this.state && Object.keys(this.state).length > 0;
        if (this.runFast) {
            this.content.setQueueTimeout(0);
        } else {
            this.content.setQueueTimeout(this.TIMEOUT);
        }
        if (this.debug) {
            console.log('STATE:', this.state, Object.keys(this.state));
            console.log('RUN FAST enabled:', this.runFast);
        }
        let fetcher = null;
        if (urlOrScript.hasOwnProperty('s')) {
            fetcher = of(urlOrScript);
        } else {
            fetcher = this.http.get(urlOrScript);
        }
        return fetcher.pipe(
                switchMap((s: any) => {
                    s = s.s[index];
                    for (const snippet of s.snippets) {
                        this.snippets[snippet.name] = snippet;
                    }
                    return this.runSnippet(this.snippets.default);
                }),
            );
    }

    check_res(res, snippet) {
        if (('' + res).indexOf('pop:') === 0) {
            if (!snippet.hasOwnProperty('name') || res.slice(4) !== snippet.name) {
                return res;
            }
        } else if (res < 0) {
            return res;
        }
        return 0;
    }

    isInState(key) {
        return key && this.state.hasOwnProperty(key);
    }

    clearState(key) {
        if (this.isInState(key)) {
            delete this.state[key];
        }
    }

    getState(key) {
        return this.state[key];
    }

    setState(key, value) {
        if (key) {
            this.state[key] = value;
        }
    }

    isCustomStep(step) {
        if (step.__component) {
            return true;
        }
        if (this.customComponents) {
            for (const comp of this.customComponents) {
                if (step.hasOwnProperty(comp.keyword)) {
                    step.__component = comp;
                    return true;
                }
            }
        }
        return false;
    }

    async doCommand(stepDo, uid?) {
        let callable = this.context[stepDo.cmd];
        const args = [];
        if (stepDo.params) {
            for (const param of stepDo.params) {
                if (param === 'record') {
                    args.push(this.record);
                } else if (param === 'context') {
                    args.push(this.context);
                } else if (param === 'uploader') {
                    this.content.addUploader(null);
                    if (this.isInState(uid)) {
                        callable = null;
                        this.content.queueFrom('...');
                        break;
                    } else {
                        args.push(await this.content.waitForInput(false));
                        this.setState(uid, true);
                    }
                } else {
                    args.push(this.i18n(param));
                }
            }
        }
        if (callable) {
            const ret = await this.content.queueFunction(async () => {
                const ret2 = await callable(...args);
                return ret2;
            });
            if (this.debug) {
                console.log('CALLABLE', stepDo.cmd, 'RETURNED', ret);
            }
            if (stepDo.variable) {
                this.record[stepDo.variable] = ret;
                await this.setCallback(stepDo.variable, ret, this.record);
            }
            return ret;
        } else {
            console.log(`ERROR: function ${stepDo.cmd} is not defined`);
        }
        return null;
    }

    async runSnippet(snippet) {
        if (this.debug) {
            console.log('RUN SNIPPET', snippet);
        }
        for (const step of snippet.steps) {
            const uid = this.lastMessage + '-' + step.uid;
            if (this.debug) {
                console.log('STEP:', step);
            }
            if (step.hasOwnProperty('say')) {
                const message = this.fillIn(this.i18n(step.say));
                this.lastMessage = message;
                this.content.addTo(message);
            } else if (step.hasOwnProperty('wait')) {
                let ret = null;
                if (uid && this.fixme) {
                    this.content.setFixme(() => {
                        this.clearState(uid);
                        this.fixme();
                    });
                }
                if (step.wait.optionsFrom) {
                    step.wait.options = this.record[step.wait.optionsFrom];
                }
                if (step.wait.options) {
                    const options = [];
                    for (const option of step.wait.options) {
                        option.value = option.hasOwnProperty('value') ? option.value : option.show;
                        option.value = option.value.hasOwnProperty('.tx') ? option.value['.tx']._ : option.value;
                        const cOption = {
                            display: this.i18n(option.show),
                            value: option.value,
                            field: option.field,
                            class: option.class,
                            echo: option.echo !== false,
                            func: option.do ? (async () => await this.doCommand(option.do)) : null,
                        };
                        if (option.unless && this.record[option.unless]) {
                            cOption.class = 'unless ' + (cOption.class || '');
                        }
                        options.push(cOption);
                    }
                    const multi = !!step.wait.multi;
                    if (this.isInState(uid) && this.runFast) {
                        ret = this.getState(uid);
                        this.content.addOptions(null, options, ret, multi);
                    } else {
                        if (this.runFast) {
                            if (this.debug) {
                                console.log('RUN FAST TURNED OFF');
                            }
                            await this.content.queueFunction(async () => {
                                this.content.setQueueTimeout(this.TIMEOUT);
                                this.runFast = false;
                            });
                        }
                        this.content.addOptions(null, options, null, multi);
                        ret = await this.content.waitForInput(false);
                        this.setState(uid, ret);
                    }
                    if (step.wait.variable) {
                        this.record[step.wait.variable] = ret;
                        await this.setCallback(step.wait.variable, ret, this.record);
                    }
                    for (const option of step.wait.options) {
                        if (ret === option.value) {
                            if (this.runFast && option.do) {
                                await this.doCommand(option.do);
                            }
                            if (option.steps) {
                                let res = await this.runSnippet(option);
                                res = this.check_res(res, snippet);
                                if (res !== 0) {
                                    return res;
                                }
                            }
                            break;
                        }
                    }
                } else {
                    if (!!step.wait.long) {
                        this.content.setTextArea();
                    }
                    this.content.setInputKind(step.wait['input-kind'] || 'text',
                        step.wait.required !== false,
                        step.wait['input-min'], step.wait['input-max'], step.wait['input-step']);
                    if (step.wait.suggestionsFrom) {
                        step.wait.suggestions = this.record[step.wait.suggestionsFrom];
                    }
                    this.content.setInputSuggestions(step.wait.suggestions);
                    if (!!step.wait.placeholder) {
                        this.content.setPlaceholder(this.i18n(step.wait.placeholder));
                    }
                    if (!!step.wait.validation) {
                        const vre = new RegExp('^' + step.wait.validation + '$');
                        this.content.setValidator((x) => {
                            return vre.test(x);
                        });
                    } else {
                        this.content.setValidator((x) => true);
                    }
                    if (this.isInState(uid) && this.runFast) {
                        ret = this.getState(uid);
                        this.content.queueFrom(ret);
                    } else {
                        if (this.runFast) {
                            if (this.debug) {
                                console.log('RUN FAST TURNED OFF');
                            }
                            await this.content.queueFunction(async () => {
                                this.content.setQueueTimeout(this.TIMEOUT);
                                this.runFast = false;
                            });
                        }
                        this.content.queueFunction(async () => {
                            this.content.reportUpdated(null);
                        });
                        ret = await this.content.waitForInput(true);
                        this.setState(uid, ret);
                    }
                    this.record[step.wait.variable] = ret;
                    await this.setCallback(step.wait.variable, ret, this.record);
                }
            } else if (step.hasOwnProperty('do')) {
                await this.doCommand(step.do, uid);
            } else if (step.hasOwnProperty('switch')) {
                const arg = step.switch.arg;
                const value = this.record[arg];
                if (this.debug) {
                    console.log('SWITCH on value', value, '(', arg, ',', this.record, ')');
                }
                let selected = null;
                let defaultCase = null;
                for (const theCase of step.switch.cases) {
                    if (this.debug) {
                        console.log('CASE', theCase);
                    }
                    if (theCase.default) {
                        if (this.debug) {
                            console.log('CASE DEFAULT');
                        }
                        defaultCase = theCase;
                    }
                    if (theCase.hasOwnProperty('match') && theCase.match === value) {
                        selected = theCase;
                    } else if (theCase.hasOwnProperty('pattern') && RegExp(theCase.pattern).test(value)) {
                        selected = theCase;
                    } else if (theCase.hasOwnProperty('undefined') && theCase.undefined && (value === null || value === undefined)) {
                        selected = theCase;
                    }
                }
                if (this.debug) {
                    console.log('CASE SELECTED', selected);
                }
                selected = selected || defaultCase;
                if (selected) {
                    if (selected.steps) {
                        let res = await this.runSnippet(selected);
                        res = this.check_res(res, snippet);
                        if (res !== 0) {
                            return res;
                        }
                    }
                } else {
                    console.log(`ERROR: no viable option for ${value} (${step.switch.arg}) in switch`);
                }
            } else if (step.hasOwnProperty('goto')) {
                if (step.goto === 'complete') {
                    return this.COMPLETE;
                }
                if (step.goto === 'break') {
                    return this.BREAK;
                }
                const gotoSnippet = this.snippets[step.goto];
                if (gotoSnippet) {
                    let res = await this.runSnippet(gotoSnippet);
                    res = this.check_res(res, snippet);
                    if (res !== 0) {
                        return res;
                    }
                } else {
                    console.log(`ERROR: unknown snippet requested ${step.goto}`);
                }
            } else if (step.hasOwnProperty('pop')) {
                return 'pop:' + step.pop;
            } else if (this.isCustomStep(step)) {
                step.__runner = this;
                step.__runFast = this.runFast;
                let ret = null;
                if (this.isInState(uid) && this.runFast) {
                    this.content.addCustomComponent(step, false);
                    ret = this.getState(uid);
                } else {
                    ret = await this.content.addCustomComponent(step, true, step.__component.timeout);
                    this.setState(uid, ret);
                }
                if (ret) {
                    this.content.queueFrom(ret, 0);
                }
            } else {
                throw new Error(`Bad step ${JSON.stringify(step)}`);
            }
        }
        return this.RETURN;
    }
}
