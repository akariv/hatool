import { CBType } from './script-runner-types';
import { HttpClient } from '@angular/common/http';
import { ContentManager } from './content-manager';
import { ScriptRunner } from './script-runner';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export class ScriptRunnerNew implements ScriptRunner {
    record = {};
    context = {};
    snippets = {};
    setCallback: CBType;

    constructor(private http: HttpClient,
                private content: ContentManager) { }

    run(url: any,
        index: any,
        context: any,
        setCallback?: CBType,
        record?: any): Observable<void> {
        this.context = context;
        this.setCallback = setCallback || ((k, v) => null);
        this.record = record || this.record;
        return this.http.get(url)
            .pipe(
                switchMap((s: any) => {
                    s = s.s[index];
                    for (const snippet of s.snippets) {
                        this.snippets[snippet.name] = snippet;
                    }
                    return this.runSnippet(this.snippets['default']);
                }),
                map(() => null)
            );
    }

    async runSnippet(snippet) {
        for (const step of snippet.steps) {
            if (step.hasOwnProperty('say')) {
                this.content.addTo(step.say);
            } else if (step.hasOwnProperty('wait')) {
                let ret = null;
                if (step.wait.options) {
                    const options = [];
                    for (const option of step.wait.options) {
                        option.value = option.hasOwnProperty('value') ? option.value : option.show;
                        options.push({
                            display: option.show,
                            value: option.value
                        });
                    }
                    this.content.addOptions(null, options);
                    ret = await this.content.waitForInput();
                    if (step.wait.variable) {
                        this.record[step.wait.variable] = ret;
                        await this.setCallback(step.wait.variable, ret, this.record);
                    }
                    for (const option of step.wait.options) {
                        if (ret === option.value) {
                            if (option.steps) {
                                if (await this.runSnippet(option)) {
                                    return true;
                                }
                            }
                            break;
                        }
                    }
                } else {
                    if (!!step.wait.long) {
                        this.content.setTextArea();
                    }
                    ret = await this.content.waitForInput();
                    this.record[step.wait.variable] = ret;
                    await this.setCallback(step.wait.variable, ret, this.record);
                }
            } else if (step.hasOwnProperty('do')) {
                const callable = this.context[step.do.cmd];
                const args = [];
                if (step.do.params) {
                    for (const param of step.do.params) {
                        if (param === 'record') {
                            args.push(this.record);
                        } else if (param === 'context') {
                            args.push(this.context);
                        } else if (param === 'uploader') {
                            this.content.addUploader(null);
                            args.push(await this.content.waitForInput());
                        } else {
                            args.push(param);
                        }
                    }
                }
                if (callable) {
                    const ret = await callable(...args);
                    if (step.variable) {
                        this.record[step.variable] = ret;
                    }
                } else {
                    console.log(`ERROR: function ${step.do.cmd} is not defined`);
                }
            } else if (step.hasOwnProperty('switch')) {
                const arg = step.switch.arg;
                const value = this.record[arg];
                let selected = null;
                let default_ = null;
                for (const case_ of step.switch.cases) {
                    if (case_.default) {
                        default_ = case_;
                    }
                    if (case_.hasOwnProperty('match') && case_.match === value) {
                        selected = case_;
                    } else if (case_.hasOwnProperty('pattern') && RegExp(case_.pattern).test(value)) {
                        selected = case_;
                    }
                }
                selected = selected || default_;
                if (selected) {
                    if (await this.runSnippet(selected)) {
                        return true;
                    }
                } else {
                    console.log(`ERROR: no viable option for ${value} (${step.switch.arg}) in switch`);
                }
            } else if (step.hasOwnProperty('goto')) {
                if (step.goto === 'complete') {
                    return true;
                }
                if (step.goto === 'return') {
                    return false;
                }
                const goto_snippet = this.snippets[step.goto];
                if (goto_snippet) {
                    if (await this.runSnippet(goto_snippet)) {
                        return true;
                    }
                } else {
                    console.log(`ERROR: unknown snippet requested ${goto_snippet}`);
                }
            } else {
                throw new Error(`Bad step ${JSON.stringify(step)}`);
            }
        }
        return false;
    }
}
