import {File} from './file.js';
import {EventEmitter} from "./EventEmitter.js";
import * as path from './path.js';

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


export class JSHandler extends EventEmitter {
    constructor(url, urlMap = {}) {
        super();

        this.url = url;
        this.files = {};
        this.urlMap = urlMap;

        this.evalHistory = new Set();

        const startTime = Date.now();

        this.loadDependencyTree('', url).then((file) => {
            console.log('All files have been loaded');
            console.log(`Loading toook ${Date.now() - startTime}`);
            return this.eval('', file, new Set());
        }).then(() => {
            console.log('All files have been run');
            console.log(`Overal took ${Date.now() - startTime}`);
            console.log(`There are ${Object.keys(this.files).length} files`);
        });
    }

    loadDependencyTree(from, url) {
        return new Promise((resolve, reject) => {
            const absoluteURL = getAbsoluteUrl(from, url);
            if (this.files[absoluteURL]) {
                resolve(this.files[absoluteURL]);
                return;
            }

            this.handleUrl(from, url).then((file) => {

                const promises = [];
                for (let i = 0; i < file.dependencies.length; i++) {
                    // const newImportHistory = new Set(importHistory);
                    // newImportHistory.add(file.url);
                    const dependency = file.dependencies[i];
                    promises.push(this.loadDependencyTree(file.url, dependency));
                }

                Promise.all(promises).then(() => {
                    resolve(file);
                });
            });
        });
    }

    handleUrl(from, url) {
        return new Promise((resolve, reject) => {
            const absoluteURL = getAbsoluteUrl(from, url);
            const file = new File(absoluteURL, this.urlMap);
            this.files[absoluteURL] = file;

            file.load().then(() => {
                return file.analyze();
            }).then(() => {
                return file.transpile({
                    loadImports: 'make_imports_work_and_shit',
                    exportedValues: 'file.exportedValues',
                });
            }).then(() => {
                return resolve(file);
            });
        });
    }


    eval(from, file, importHistory) {
        return new Promise((resolve, reject) => {
            const make_imports_work_and_shit = (imports_array, runCode) => {
                const forwards = [];
                for (let i = 0; i < file.analyzer.exports.length; i++) {
                    if (file.analyzer.exports[i].from) {
                        forwards.push(file.analyzer.exports[i])
                    }
                }

                const checkIfAllIsDone = () => {

                    const curImports = [];
                    const setters = {};

                    for (let i = 0; i < file.analyzer.imports.length; i++) {
                        const curUrl = getAbsoluteUrl(file.url, file.analyzer.imports[i].from);

                        if (file.analyzer.imports[i].isAll) {
                            curImports.push(this.files[curUrl].exportedValues);
                        } else if (file.analyzer.imports[i].isDefault) {
                            curImports.push(this.files[curUrl].exportedValues.default)
                        } else if (!file.analyzer.imports[i].isES5) {
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

                    file._isRun = true;
                    runCode.bind(window)(file.exportedValues, setters, ...curImports);

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
                };

                let promises = [() => Promise.resolve()];
                for (let i = 0; i < imports_array.length; i++) {
                    const newImportHistory = new Set(importHistory);
                    newImportHistory.add(file.url);
                    const absoluteURL = getAbsoluteUrl(file.url, imports_array[i]);
                    const cur = this.files[absoluteURL];
                    promises.push(() => this.eval(file.url, cur, newImportHistory));
                }

                const _resolve = (i) => {
                    if (i === promises.length) {
                        checkIfAllIsDone();
                        return;
                    }

                    promises[i]().then(() => {
                        _resolve(++i);
                    })
                };

                _resolve(0);
            };

            if (importHistory.has(file.url)) {
                resolve();
                return;
            }

            if (this.evalHistory.has(file.url)) {
                resolve();
                return;
            }

            try {
                this.evalHistory.add(file.url);
                eval(file.transpiledSource);
            } catch (err) {
                throw err;
            }
        });
    }
}
