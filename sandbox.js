const headers = {
	window: `const document = {};
			 document.createElement = ()=>{}
             const window = {document: document};
             window.addEventListener = ()=>{}
             const Function = ()=>{}
             Function.prototype={name: 'camel'};
             //const console = {};
             //console.log = ()=>{}
             //console.warn = ()=>{}
             `,
	sandbox: `const sandbox_import = ()=>{}`

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
	constructor(url, exportType = sandbox.types.EXPORT_WINDOW_SCOPE, global = {}) {
		super();
		this.url = url;
		this.source = null;
		sandbox.loadUrl(url).then(data => {
			this.source = data;
			this.emit('loaded');

			this.source = transpileImports(this.source);
			this.emit('transpiled');

			this.run();
		});
		this.exports = {};
		this.scope = global;
		this.dependencies = [];
		this.exportType = exportType;
		this.isReady = false;
		this._readyDependensyCount = 0;

		this.on('ready', () => {
			this.isReady = true;
		})
	}


	static loadUrl(url) {
		return new Promise((resolve, reject) => {
			ajax.get(url, {}, (data) => {
				resolve(data);
			});
		});
	}

	addDependency(url, exportType = this.exportType) {
		const dependency = new sandbox(url, exportType);

		// change this logic so we wont have problems
		// with many dependencies and get this event
		// sooner that all the dependencies are ready
		dependency.on('ready', () => {
			this._readyDependensyCount++;
			if (this._readyDependensyCount === this.dependencies.length) {
				this.emit('dependencies_ready');
			}
		});

		this.dependencies.push(dependency);
	}

	run() {

		// research arguments.callee.caller
		// to see if it breaks the sandbox
		const sandbox_import = (imports, callback) => {
			// handle the case with duplicate imports however the standard says we should
			// handle looped imports the way standard tells us to

			if (imports.constructor !== Array) {
				throw new Error('sandbox_import imports argument must be an array');
			}

			for (let i = 0; i < imports.length; i++) {
				this.addDependency(imports[i].url, sandbox.types.EXPORT_ES_MODULE)
			}
			this.on('dependencies_ready', () => {
				const args = [];

				for (let i = 0; i < this.dependencies.length; i++) {

					// import "module-name";
					if (!imports[i].obj) {
						continue;
					}

					// import * as name from "module-name";
					if (imports[i].obj.length === 0) {
						args.push(this.dependencies[i].exports);
						continue;
					}

					// import { member } from "module-name";
					// import { member as alias } from "module-name";
					// import { member1 , member2 } from "module-name";
					// import { member1 , member2 as alias2 , [...] } from "module-name";
					for (let j = 0; j < imports[i].obj.length; j++) {
						// handle the case when the dependency is missing
						args.push(this.dependencies[i].exports[imports[i].obj[j]]);
					}
				}
				callback && callback(...args);


				// no idea why this happens
				// discuss and fix this later
				setTimeout(() => {
					this.emit('ready');
				}, 1);

			});
			// if we dont have any dependencies just go ahead and fire the event
			if (this.dependencies.length === 0) {
				this.emit('dependencies_ready');
			}

		};

		const joinedSource = ` 	
		(function(sandbox_import, ${Object.keys(this.scope).join(', ')}){
			const sandbox_exports = {};
			${headers['window']};
			${this.source};
			return sandbox_exports;
		})(sandbox_import, ${Object.keys(this.scope).map(i => `this.scope.${i}`).join(', ')})`;
		//console.log(joinedSource);
		this.exports = eval(joinedSource);
	}
}

sandbox.types = {};
sandbox.types.EXPORT_ES_MODULE = 0;
sandbox.types.EXPORT_WINDOW_SCOPE = 1;