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


        this.handleUrl('', url);
    }

    handleUrl(from, url) {
        return new Promise((resolve, reject) => {
            const absoluteURL = getAbsoluteUrl(from, url);

            if (this.files.hasOwnProperty(absoluteURL)) {
                const file = this.files[absoluteURL];
                if (file.isReady) {
                    resolve(file);
                } else {
                    file.on('ready', () => {
                        resolve(file)
                    });
                }

                return;
            }

            const file = new File(absoluteURL);
            this.files[absoluteURL] = file;

            file.load().then(() => {
                return file.analyze();
            }).then(() => {
                return file.transpile({
                    loadImports: 'make_imports_work_and_shit',
                    exportedValues: 'file.exportedValues',
                });
            }).then(() => {
                return this.eval(file);
            }).then(() => {
                resolve(file);
            })
            // todo: handle errors
            // .catch((err) => {
            //     console.log(err);
            // })
        });
    }


    eval(file) {
        return new Promise((resolve, reject) => {

            const make_imports_work_and_shit = (imports_array, runCode) => {
                const forwards = [];
                for (let i = 0; i < file.analyzer.exports.length; i++) {
                    if (file.analyzer.exports[i].from) {
                        forwards.push(file.analyzer.exports[i])
                    }
                }

                const n = imports_array.length + forwards.length;
                let readyCount = 0;

                const checkIfAllIsDone = () => {
                    readyCount++;
                    if (readyCount >= n) {

                        const curImports = [];
                        const setters = [];

                        for (let i = 0; i < file.analyzer.imports.length; i++) {
                            const curUrl = getAbsoluteUrl(file.url, file.analyzer.imports[i].from);

                            if (file.analyzer.imports[i].isAll) {
                                curImports.push(this.files[curUrl].exportedValues);
                            } else if (file.analyzer.imports[i].isDefault) {
                                curImports.push(this.files[curUrl].exportedValues.default)
                            } else {
                                curImports.push(this.files[curUrl].exportedValues[file.analyzer.imports[i].name]);
                                setters.push({
                                    from: this.files[curUrl].exportedValues,
                                    name: file.analyzer.imports[i].name,
                                    label: file.analyzer.imports[i].label
                                });
                            }
                        }

                        runCode(setters, ...curImports);

                        const forwardExport = (fromUrl, name, label) => {
                            file.exportedValues[`_${label}`] = this.files[fromUrl].exportedValues[name];
                            Object.defineProperty(file.exportedValues, label, {
                                enumerable: true,
                                get: () => file.exportedValues[`_${label}`],
                                set: (value) => {
                                    file.exportedValues[`_${label}`] = value;
                                    file.exportedValues.emit(label, value);
                                }
                            });

                            file.exportedValues.__labels__.add(label);
                        };

                        for (let i = 0; i < forwards.length; i++) {
                            const fromUrl = getAbsoluteUrl(file.url, forwards[i].from);

                            if(forwards[i].isAll) {
                                this.files[fromUrl].exportedValues.__labels__.forEach((name) => {
                                    forwardExport(fromUrl, name, name);
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

                for (let i = 0; i < imports_array.length; i++) {
                    this.handleUrl(file.url, imports_array[i]).then(() => {
                        checkIfAllIsDone();
                    });
                }

                for (let i = 0; i < forwards.length; i++) {
                    this.handleUrl(file.url, forwards[i].from).then(() => {
                        checkIfAllIsDone();
                    });
                }

                if (n === 0) {
                    checkIfAllIsDone();
                }
            };

            console.log('eval', file.url);
            try {
                eval(file.transpiledSource);
            } catch (err) {
                throw err;
            }
        });
    }
}
