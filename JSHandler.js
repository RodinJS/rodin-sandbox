const getId = (object) => {
    if (!object["__uid__"]) {
        object["__uid__"] = Math.random();
    }

    return object["__uid__"];
};

const getAbsoluteUrl = (from, url) => {
    if (path.isAbsolute(url)) {
        return url;
    }

    return path.join(path.getDirectory(from), url);
};

class JSHandler extends EventEmitter {
    constructor(url) {
        super();

        this.url = url;
        this.files = {};


        this.handleUrl(new Set(), '', url);
    }

    handleUrl(importers, from, url) {
        return new Promise((resolve, reject) => {
            const absoluteURL = getAbsoluteUrl(from, url);

            if (this.files.hasOwnProperty(absoluteURL)) {

                const file = this.files[absoluteURL];
                file.importers = new Set([...file.importers, ...importers, from]);

                if (file.importers.has(absoluteURL)) {
                    return resolve(file);
                }

                if (file.isReady) {
                    resolve(file);
                } else {
                    file.on('ready', () => {
                        resolve(file)
                    });
                }

                return;
            }

            const file = new File(absoluteURL, new Set(importers));
            file.importers.add(from);
            this.files[absoluteURL] = file;

            file.load().then(() => {
                return file.analyze();
            }).then(() => {
                return file.transpile({
                    loadImports: 'make_imports_work_and_shit',
                    exportedValues: 'file.exportedValues',
                });
            }).then(() => {
                return this.eval(file, from);
            }).then(() => {
                resolve(file);
            });
        });
    }


    eval(file, from) {
        return new Promise((resolve, reject) => {

            const make_imports_work_and_shit = (imports_array, runCode) => {
                const forwards = [];
                for (let i = 0; i < file.analyzer.exports.length; i++) {
                    if (file.analyzer.exports[i].from) {
                        forwards.push(file.analyzer.exports[i])
                    }
                }

                const n = imports_array.length; //+ forwards.length;
                let readyCount = 0;

                const checkIfAllIsDone = () => {
                    readyCount++;
                    if (readyCount >= n) {

                        const curImports = [];
                        // const setters = [];

                        const setters = {};

                        for (let i = 0; i < file.analyzer.imports.length; i++) {
                            const curUrl = getAbsoluteUrl(file.url, file.analyzer.imports[i].from);

                            if (file.analyzer.imports[i].isAll) {
                                curImports.push(this.files[curUrl].exportedValues);
                            } else if (file.analyzer.imports[i].isDefault) {
                                curImports.push(this.files[curUrl].exportedValues.default)
                            } else {
                                curImports.push(this.files[curUrl].exportedValues[file.analyzer.imports[i].name]);
                                const key = getId(this.files[curUrl].exportedValues);
                                if (!setters[key]) {
                                    setters[key] = {
                                        from: this.files[curUrl].exportedValues,
                                        imports: {}
                                    }
                                }

                                setters[key].imports[file.analyzer.imports[i].name] = file.analyzer.imports[i].label;
                            }
                        }

                        runCode(setters, ...curImports);

                        const forwardExport = (fromUrl, name, label) => {

                            if (file.exportedValues.hasOwnProperty(label))
                                return;

                            file.exportedValues[`_${label}`] = void 0;
                            Object.defineProperty(file.exportedValues, label, {
                                enumerable: true,
                                get: () => file.exportedValues[`_${label}`],
                                set: (value) => {
                                    file.exportedValues[`_${label}`] = value;
                                    file.exportedValues.emit('valuechange', {newValue: value, label: label});
                                }
                            });
                            file.exportedValues[label] = this.files[fromUrl].exportedValues[name];

                            file.exportedValues.__labels__.add(label);
                        };

                        for (let i = 0; i < forwards.length; i++) {
                            const fromUrl = getAbsoluteUrl(file.url, forwards[i].from);

                            this.files[fromUrl].exportedValues.on('valuechange', evt => {
                                if (file.exportedValues[evt.label] !== evt.newValue) {
                                    file.exportedValues[evt.label] = evt.newValue;
                                }
                            });

                            if (forwards[i].isAll) {
                                this.files[fromUrl].exportedValues.__labels__.forEach((name) => {
                                    forwardExport(fromUrl, name, name);
                                });

                                this.files[fromUrl].exportedValues.on('valuechange', evt => {
                                    if (!file.exportedValues.hasOwnProperty(evt.label)) {
                                        forwardExport(fromUrl, evt.label, evt.label)
                                    }
                                });
                            } else {
                                forwardExport(fromUrl, forwards[i].name, forwards[i].label);
                            }
                        }

                        file.isReady = true;
                        file.emit('ready', {});

                        resolve();
                    }
                };

                // for (let i = 0; i < imports_array.length; i++) {
                //     this.handleUrl(file.importers, file.url, imports_array[i]).then((file) => {
                //         checkIfAllIsDone();
                //     });
                // }

                let fi = 0;

                const _handleURL = (...args) => {
                    this.handleUrl(...args).then(() => {
                        fi++;

                        if(fi < imports_array.length) {
                            _handleURL(file.importers, file.url, imports_array[fi]);
                        }

                        checkIfAllIsDone();
                    });

                };

                if (imports_array.length > 0)
                    _handleURL(file.importers, file.url, imports_array[fi]);

                if (n === 0) {
                    checkIfAllIsDone();
                }
            };

            console.log('eval', from, file.url);
            try {
                eval(file.transpiledSource);
            } catch (err) {
                throw err;
            }
        });
    }
}
