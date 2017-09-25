class StringTokenizer {
    constructor(str) {
        this.string = str;
        this.changes = [];
    }

    add(index, token) {
        this.changes.push({type: StringTokenizer.changeTypes.add, index: index, token: token});
        return this;
    }

    addExportedVariable(label) {
        this.add(-1, `_exports._${label} = void 0;\n`);
        this.add(-1, `Object.defineProperty(_exports, '${label}', {
            enumerable: true,
            set: (value) => {     
                _exports._${label} = value;
                _exports.emit('valuechange', {newValue: value, label: '${label}'});
            },
            get: () => _exports._${label}
        })\n\n`);
        this.add(-1, `_exports.__labels__.add('${label}')\n`);
    }

    remove(start, end) {
        this.changes.push({type: StringTokenizer.changeTypes.remove, index: start, end: end});
        return this;
    }

    replace(start, end, token) {
        this.add(start, token);
        this.remove(start, end);
    }

    apply() {

        const tmp = [];

        let curIndexOriginalString = 0;
        this.changes.forEach((e, i) => {
            e.originalIndex = i;
        });

        this.changes.sort((i, j) => {
            if (i.index !== j.index) {
                return i.index - j.index;
            }

            if (i.type !== j.type) {
                return i.type - j.type
            }

            return i.originalIndex - j.originalIndex;
        });

        for (let i = 0; i < this.changes.length; i++) {
            if (this.changes[i].type === StringTokenizer.changeTypes.add) {
                tmp.push(this.string.substring(curIndexOriginalString, this.changes[i].index));
                tmp.push(this.changes[i].token);
                curIndexOriginalString = this.changes[i].index;
            }

            if (this.changes[i].type === StringTokenizer.changeTypes.remove) {
                tmp.push(this.string.substring(curIndexOriginalString, this.changes[i].index));
                curIndexOriginalString = this.changes[i].end;
            }
        }

        tmp.push(this.string.substring(curIndexOriginalString));
        return tmp.join('');
    }
}

StringTokenizer.changeTypes = {
    add: 1,
    remove: 2
};

class File extends EventEmitter {
    constructor(url) {
        super();
        this.url = url;
        this.exports = {};
        this.analyzer = null;
        this.isReady = false;

        this.exportedValues = new EventEmitter();
        this.exportedValues.__labels__ = new Set();

        this.dependencies = null;

        this._isLoaded = false;
        this._isAnalyzed = false;
        this._isTranspiled = false;
        this._isRun = false;
    }

    load() {
        return new Promise((resolve, reject) => {
            // todo: handle errors
            ajax.get(this.url, {}, (data) => {
                this.source = data;
                this._isLoaded = true;
                resolve(data);
            });
        });
    }

    analyze() {
        return new Promise((resolve, reject) => {
            this.analyzer = new StaticAnalyzer(this.source);
            this.analyzer.analyzeCommentsAndStrings();
            this.analyzer.analyzeScopes();
            this.analyzer.analyzeFunctionParams();
            this.analyzer.findImports();
            this.analyzer.findExports();

            this._isAnalyzed = true;
            resolve();
        });
    }

    transpile(args) {
        return new Promise((resolve, reject) => {
            const imports = this.analyzer.imports;
            const exports = this.analyzer.exports;
            const tokenizer = new StringTokenizer(this.source);

            this.dependencies = Array.from(
                new Set(
                    this.analyzer.imports.
                    concat(this.analyzer.exports.filter(i => !!i.from)).map(i => `${i.from}`)
                )
            );

            const import_variables = imports.filter(i => !i.isES5).map(i => i.label).join(', ');

            tokenizer.add(-1, `// ${this.url}\n`);
            tokenizer.add(-1, `${args.loadImports}([${this.dependencies.map(i=>`'${i}'`).join(', ')}],(function (_exports, _setters, ${import_variables}){\n`);
            // todo: fix this later. no time now
            tokenizer.add(-1, `
                for(let i in _setters) {
                    _setters[i].from.on('valuechange', evt => {
                        if(!_setters[i].imports[evt.label]) return;
                        let shouldEmit = eval(\`\${evt.label} !== evt.newValue\`);
                        eval(\`\${evt.label} = evt.newValue\`);          
                        if(shouldEmit && ${args.exportedValues}.hasOwnProperty(evt.label)) {
                            ${args.exportedValues}[evt.label] = evt.newValue;
                        }
                    })
                }
            `);

            let curIndex = -1;
            for (let i = 0; i < imports.length; i++) {
                if (curIndex === imports[i].importIndex) continue;
                tokenizer.add(imports[i].importBeginning, '/*');
                tokenizer.add(imports[i].importEnd, '*/');
                curIndex = imports[i].importIndex;
            }

            const processedNames = {};

            curIndex = -1;
            for (let i = 0; i < exports.length; i++) {
                const exprt = exports[i];
                if(exprt.from) {
                    tokenizer.remove(exprt.exportBeginning, exprt.exportEnd);
                    continue;
                }

                const name = exprt.name;
                const label = exprt.label;

                if (!processedNames[name]) {
                    tokenizer.addExportedVariable(label);
                } else {
                    tokenizer.add(-1, `Object.defineProperty(_exports, '${label}', {
                        enumerable: true,
                        get: () => _exports.${processedNames[name]},
                    })`);
                    tokenizer.add(-1, `\n_exports.on('${processedNames[name]}', value => _exports.emit('${label}', value))\n`);

                    continue;
                }

                processedNames[name] = label;

                let references = [];

                if (!exprt.isDefault) {
                    references = this.analyzer.findReferences(name);
                }


                if (curIndex !== exprt.exportIndex) {
                    if (exprt.isLet || exprt.isVar || exprt.isConst) {
                        tokenizer.remove(exprt.exportBeginning, exprt.exportBeginning + 6);
                    } else if (exprt.isBrackets) {
                        tokenizer.remove(exprt.exportBeginning, exprt.exportEnd);
                    } else if (exprt.isFunction || exprt.isGeneratorFunction || exprt.isClass) {
                        tokenizer.remove(exprt.exportBeginning, exprt.exportBeginning + 6);
                    } else if (exprt.isDefault) {
                        tokenizer.replace(exprt.exportBeginning, exprt.exportEnd + 6, `_exports.default = `);
                    }
                }

                if(exprt.isBrackets && !exprt.from) {
                    tokenizer.add(exprt.exportEnd, `\n_exports.${label} = ${name}\n`);
                }

                curIndex = exprt.exportIndex;

                for (let j = 0; j < references.length; j++) {
                    const ref = references[j];

                    if (ref.declaration) {
                        if (ref.declaration === 'function' || ref.declaration === 'function*') {
                            tokenizer.add(-1, `_exports._${label} = ${name};\n`);
                        } else if (ref.declaration === 'class') {
                            tokenizer.add(ref.declarationStart, `_exports.${label} = `);
                        } else if (ref.isOverride.value) {
                            tokenizer.add(ref.isOverride.index + 1, `= _exports.${label} `);
                        }
                    } else if (!exprt.isBrackets || (ref.index < exprt.exportBeginning || ref.index >= exprt.exportEnd)) {
                        tokenizer.replace(ref.index, ref.index + name.length, `_exports.${label}`)
                    }
                }
            }

            tokenizer.add(this.source.length, `\n}))`);

            this.transpiledSource = tokenizer.apply();
            // console.log(this.transpiledSource);
            this._isTranspiled = true;
            this.emit('transpiled', {});
            resolve();
        });
    }
}
