const headers = {
    window: `const document = {};
             const window = {document: document};
             const Function = ()=>{}
             Function.prototype={name: 'camel'}
             ;`
};

const sourceMap = '\n//# sourceMappingURL=test.js';

const map = `{
    version: 3,
    file: "test.js.map",
    sources: [
        "test.js"
    ],
    sourceRoot: "/",
    names: [],
    mappings: ""
}`;

class sandbox {
    constructor(url) {
        this.url = url;
        this.source = null;
        sandbox.loadUrl(url).then(data => {
            this.source = data;
            //console.log(data);
        });

    }

    static loadUrl(url) {
        return new Promise((resolve, reject) => {
            ajax.get(url, {}, (data) => {
                resolve(data);
            });
        });
    }


    run() {
        //Function("Function = ()=>{return ()=>{return null}}\n" + "return Function('return this')()")()
        const joinedSource = '(new function(){console.log("this is " + this);\n' + headers['window'] + '\n' + this.source + ';\n this.run = ()=> {return this;}}).run()';// + sourceMap;
        //console.log(joinedSource);
        this.scope = eval(joinedSource);
    }
}