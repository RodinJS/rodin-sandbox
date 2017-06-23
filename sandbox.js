const headers = {
    window: `const document = {};
			 document.createElement = ()=>{};
             const window = {document: document};
             window.addEventListener = ()=>{};
             const Function = ()=>{};
             Function.prototype={name: 'camel'};
             //const console = {};
             //console.log = ()=>{};
             //console.warn = ()=>{};
             ;`,
    sandbox: `const sandbox_import = ()=>{};
                `

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

class sandbox extends EventEmitter {
    constructor(url, scope = {}) {
        super();
        this.url = url;
        this.source = null;
        sandbox.loadUrl(url).then(data => {
            this.source = data;
            this.run();
            this.emit('ready');
            //console.log(data);
        });
        this.exports = {};
        this.scope = scope;
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
        const joinedSource = ` (function(){
                                const sandbox_exports = {};
								${headers['window']};
								${this.source};
								return sandbox_exports;
								}).bind(this.scope)()`;// + sourceMap;
        //console.log(joinedSource);
        this.exports = eval(joinedSource);
    }
}