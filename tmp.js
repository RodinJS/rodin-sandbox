const allRes = [];

const runStuff = () => {
	let source = '';


	ajax.get('tmp.js', {}, data => {
		const res = [];
		source = data;
		console.log(source.length);
		let a = new StaticAnalyzer(source);
		let t = null;

		t = Date.now();
		a.analyzeCommentsAndStrings();
		res.push(`comments and string analysis: ${Date.now() - t}`);

		// let count = 100;
		// while (count <= 100000) {
		//     let arr = [];
		//     for (let i = 0; i < count; i++) {
		//         arr.push(Math.floor(Math.random() * source.length));
		//     }
		//
		//     t = Date.now();
		//     for (let i = 0; i < arr.length; i++) {
		//         allRes.push(a.isCommentOrString(arr[i]));
		//     }
		//     res.push(`Checking ${count} elements takes: ${Date.now() - t}`);
		//     count *= 10;
		// }

		t = Date.now();
		a.analyzeScopes();
		res.push(`Analysing scopes takes: ${Date.now() - t}`);

		console.log(res.join('\n'));
		//alert(res.join('\n'));
		window.a = a;
	}, false);

};

setTimeout(runStuff, 2000);
