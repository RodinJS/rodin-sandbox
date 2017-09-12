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
        const absoluteURL = getAbsoluteUrl(from, url);

        if (absoluteURL in this.files) {
            return new Promise.resolve(this.files[absoluteURL].exportedValues);
        }

        const file = new File(absoluteURL);


        return file.load().then(() => {
            return file.analyze();
        }).then(() => {
            return file.transpile({
                loadImports: 'make_imports_work_and_shit',
                exportedValues: 'file.exportedValues',
            });
        }).then(() => {
            return this.eval(file);
        })
        // .catch((err)=>{
        // console.log(err);
        // })
    }


    eval(file) {
        return new Promise((resolve, reject)=>{

            const make_imports_work_and_shit = (imports_array, runCode) => {
                const n = imports_array.length;
                let readyCount = 0;

                const checkIfAllIsDone = () => {
                    readyCount++;
                    if (readyCount >= n) {
                        this.files[file.url] = file;

                        const curImports = [];
                        for (let i = 0; i < file.analyzer.imports.length; i++) {
                            const curUrl = getAbsoluteUrl(file.url, file.analyzer.imports[i].from);
                            if (file.analyzer.imports[i].isAll){
                                curImports.push(this.files[curUrl].exportedValues);
                            } else if (file.analyzer.imports[i].isDefault) {
                                curImports.push(this.files[curUrl].exportedValues['default'])
                            } else {
                                curImports.push(this.files[curUrl].exportedValues[file.analyzer.imports[i].name])
                            }

                            // console.log(file.analyzer);
                        }

                        runCode(...curImports);
                    }
                };

                for (let i = 0; i < n; i++) {
                    this.handleUrl(file.url, imports_array[i]).then( () => {
                        checkIfAllIsDone();
                    });
                }

                if (n === 0) {
                    checkIfAllIsDone();
                }
            };

            // console.log(file.transpiledSource);
            eval(file.transpiledSource);
            resolve();
        });
    }
}
