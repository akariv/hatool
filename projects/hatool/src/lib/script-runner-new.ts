import { CBType } from './script-runner-types';
import { HttpClient } from '@angular/common/http';
import { ContentManager } from './content-manager';
import { ScriptRunner } from './script-runner';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export class ScriptRunnerNew implements ScriptRunner {
    record = {};
    context = {};
    snippets = {};
    setCallback: CBType;
    runFast = false;
    lastMessage = '';
    public debug = false;

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
                private locale: string) {
        console.log('Running with locale', this.locale);
    }

    set timeout(value) {
        this.TIMEOUT = value;
    }

    i18n(obj) {
        if (obj && obj['.tx']) {
            if (this.locale && obj['.tx'][this.locale]) {
                return obj['.tx'][this.locale];
            } else {
                return obj['.tx']['_'];
            }
        }
        return obj;
    }

    get(obj: any, field) {
        const parts = field.split('.');
        for (const part of parts) {
            obj = obj[part] || {};
        }
        if (Object.entries(obj).length > 0) {
            return obj;
        }
        return null;
    }

    fillIn(message: string) {
        return message.replace(
            RegExp('({{([a-zA-Z_.0-9]+)}})', 'g'),
            (match, p1, p2) => {
                return this.get(this.record, p2) || p2;
            }
        );
    }

    run(url_or_script: any,
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
        if (url_or_script.hasOwnProperty('s')) {
            fetcher = of(url_or_script);
        } else {
            fetcher = this.http.get(url_or_script);
        }
        return fetcher.pipe(
                switchMap((s: any) => {
                    s = s.s[index];
                    for (const snippet of s.snippets) {
                        this.snippets[snippet.name] = snippet;
                    }
                    return this.runSnippet(this.snippets['default']);
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
                if (step.wait.optionsFrom) {
                    step.wait.options = this.record[step.wait.optionsFrom];
                }
                if (step.wait.options) {
                    const options = [];
                    for (const option of step.wait.options) {
                        option.value = option.hasOwnProperty('value') ? option.value : option.show;
                        option.value = option.value.hasOwnProperty('.tx') ? option.value['.tx']['_'] : option.value;
                        if (!option.unless || !this.record[option.unless]) {
                            options.push({
                                display: this.i18n(option.show),
                                value: option.value,
                                class: option.class
                            });
                        }
                    }
                    if (uid && this.state[uid] && this.runFast) {
                        ret = this.state[uid];
                        this.content.addOptions(null, options, ret);
                    } else {
                        if (this.runFast) {
                            if (this.debug) {
                                console.log('RUN FAST TURNED OFF');
                            }
                            this.runFast = false;
                            await this.content.queueFunction(async () => {
                                this.content.setQueueTimeout(this.TIMEOUT);
                            });
                        }
                        this.content.addOptions(null, options);
                        ret = await this.content.waitForInput(false);
                        if (uid) {
                            this.state[uid] = ret;
                        }
                    }
                    if (step.wait.variable) {
                        this.record[step.wait.variable] = ret;
                        await this.setCallback(step.wait.variable, ret, this.record);
                    }
                    for (const option of step.wait.options) {
                        if (ret === option.value) {
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
                        step.wait['input-min'], step.wait['input-max'], step.wait['input-step']);
                    if (!!step.wait.placeholder) {
                        this.content.setPlaceholder(this.i18n(step.wait.placeholder));
                    }
                    if (!!step.wait.validation) {
                        const vre = new RegExp('^' + step.wait.validation + '$');
                        this.content.setValidator((x) => {
                            return vre.test(x);
                        });
                    }
                    if (uid && this.state[uid]) {
                        ret = this.state[uid];
                        this.content.queueFrom(ret);
                    } else {
                        ret = await this.content.waitForInput(true);
                        if (uid) {
                            this.state[uid] = ret;
                        }
                    }
                    this.record[step.wait.variable] = ret;
                    await this.setCallback(step.wait.variable, ret, this.record);
                }
            } else if (step.hasOwnProperty('do')) {
                let callable = this.context[step.do.cmd];
                const args = [];
                if (step.do.params) {
                    for (const param of step.do.params) {
                        if (param === 'record') {
                            args.push(this.record);
                        } else if (param === 'context') {
                            args.push(this.context);
                        } else if (param === 'uploader') {
                            this.content.addUploader(null);
                            if (uid && this.state[uid]) {
                                callable = null;
                                this.content.queueFrom('...');
                                break;
                            } else {
                                args.push(await this.content.waitForInput(false));
                                this.state[uid] = true;
                            }
                        } else {
                            args.push(this.i18n(param));
                        }
                    }
                }
                if (callable) {
                    const ret = await this.content.queueFunction(async () => await callable(...args));
                    if (step.do.variable) {
                        this.record[step.do.variable] = ret;
                        await this.setCallback(step.do.variable, ret, this.record);
                    }
                } else {
                    console.log(`ERROR: function ${step.do.cmd} is not defined`);
                }
            } else if (step.hasOwnProperty('switch')) {
                const arg = step.switch.arg;
                const value = this.record[arg];
                if (this.debug) {
                    console.log('SWITCH on value', value, '(', arg, ',', this.record, ')');
                }
                let selected = null;
                let default_ = null;
                for (const case_ of step.switch.cases) {
                    if (this.debug) {
                        console.log('CASE', case_);
                    }
                    if (case_.default) {
                        if (this.debug) {
                            console.log('CASE DEFAULT');
                        }
                        default_ = case_;
                    }
                    if (case_.hasOwnProperty('match') && case_.match === value) {
                        selected = case_;
                    } else if (case_.hasOwnProperty('pattern') && RegExp(case_.pattern).test(value)) {
                        selected = case_;
                    } else if (case_.hasOwnProperty('undefined') && case_.undefined && (value === null || !(arg in this.record))) {
                        selected = case_;
                    }
                }
                if (this.debug) {
                    console.log('CASE SELECTED', selected);
                }
                selected = selected || default_;
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
                const goto_snippet = this.snippets[step.goto];
                if (goto_snippet) {
                    let res = await this.runSnippet(goto_snippet);
                    res = this.check_res(res, snippet);
                    if (res !== 0) {
                        return res;
                    }
                } else {
                    console.log(`ERROR: unknown snippet requested ${step.goto}`);
                }
            } else if (step.hasOwnProperty('pop')) {
                return 'pop:' + step.pop;
            } else {
                throw new Error(`Bad step ${JSON.stringify(step)}`);
            }
        }
        return this.RETURN;
    }
}
