class StringTokenizer {
    constructor(str) {
        this.string = str;
        this.changes = [];
    }

    add(index, token) {
        this.changes.push({type: StringTokenizer.changeTypes.add, index: index, token: token});
        return this;
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

        this.exportedValues = {};
    }

    load() {
        return new Promise((resolve, reject) => {
            // todo: handle errors
            ajax.get(this.url, {}, (data) => {
                this.source = data;
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
            resolve();
        });
    }

    transpile(args) {
        return new Promise((resolve, reject) => {
            console.time("transpile");
            const imports = this.analyzer.imports;
            const exports = this.analyzer.exports;
            const tokenizer = new StringTokenizer(this.source);

            const import_files = Array.from(new Set(this.analyzer.imports.map(i => `'${i.from}'`))).join(', ');
            const import_variables = imports.map(i => i.label).join(', ');

            tokenizer.add(0, `${args.loadImports}([${import_files}],((${import_variables})=>{\n`);
            tokenizer.add(0, `const exports = ${args.exportedValues};\n`);

            let curIndex = -1;
            for (let i = 0; i < imports.length; i++) {
                if (curIndex === imports[i].importIndex) continue;
                tokenizer.add(imports[i].importBeginning, '/*');
                tokenizer.add(imports[i].importEnd, '*/');
                // tokenizer.remove(imports[i].importBeginning, imports[i].importEnd);
                curIndex = imports[i].importIndex;
            }

            const processedNames = {};

            curIndex = -1;
            for (let i = 0; i < exports.length; i++) {
                const exprt = exports[i];
                const name = exprt.name;
                const label = exprt.label;

                if (processedNames[name]) {
                    tokenizer.add(this.source.length, `Object.defineProperty(exports, '${label}', {
                        get: function() { return exports.${processedNames[name]}; }
                    })`);
                    continue;
                }

                processedNames[name] = label;

                let references = [];
                if (!exprt.isDefault) {
                    references = this.analyzer.findReferences(name);
                }


                // if (exprt.isLet || exprt.isVar || exprt.isConst) {
                //     tokenizer.remove(exprt.exportBeginning, exprt.exportBeginning + 6);
                //
                // } else if (exprt.isBrackets) {
                //     if (curIndex !== exprt.exportIndex) {
                //         tokenizer.remove(exprt.exportBeginning, exprt.exportEnd);
                //     }
                //     curIndex = exprt.exportIndex;
                //-
                //     tokenizer.add(this.source.length, `\nexports.${label} = ${name}`);
                // } else if (exprt.isFunction || exprt.isGeneratorFunction) {
                //     tokenizer.remove(exprt.exportBeginning, exprt.exportBeginning + 6);
                // } else if (exprt.isDefault) {
                //     tokenizer.replace(exprt.exportBeginning, exprt.exportEnd + 6, `exports.default = `);
                // } else {
                //
                // }

                if (curIndex !== exprt.exportIndex) {
                    if (exprt.isLet || exprt.isVar || exprt.isConst) {
                        tokenizer.remove(exprt.exportBeginning, exprt.exportBeginning + 6);
                    } else if (exprt.isBrackets) {
                        tokenizer.remove(exprt.exportBeginning, exprt.exportEnd);
                    } else if (exprt.isFunction || exprt.isGeneratorFunction || exprt.isClass) {
                        tokenizer.remove(exprt.exportBeginning, exprt.exportBeginning + 6);
                        tokenizer.add(this.source.length, `\nexports.${label} = ${name};`);
                    } else if (exprt.isDefault) {
                        tokenizer.replace(exprt.exportBeginning, exprt.exportEnd + 6, `exports.default = `);
                    }
                }

                curIndex = exprt.exportIndex;

                for (let j = 0; j < references.length; j++) {
                    const ref = references[j];

                    if (ref.declaration) {
                        if (ref.declaration === 'function' || ref.declaration === 'function*') {
                            tokenizer.add(0, `exports.${label} = ${name};\n`);
                        } else if (ref.declaration === 'class') {
                            tokenizer.add(this.source.length, `\nexports.${label} = ${name};\n`);
                        } else if (ref.isOverride.value) {
                            tokenizer.add(ref.isOverride.index + 1, `= exports.${label} `);
                        }
                    } else if (!exprt.isBrackets || (ref.index < exprt.exportBeginning || ref.index >= exprt.exportEnd)) {
                        tokenizer.replace(ref.index, ref.index + name.length, `exports.${label}`)
                    }
                }
            }

            tokenizer.add(this.source.length, `\n}))`);

            this.transpiledSource = tokenizer.apply();
            // console.log(this.transpiledSource);
            console.timeEnd('transpile');
            resolve();
        });
    }
}
