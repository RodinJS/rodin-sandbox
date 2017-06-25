const transpileImports = (source) => {
	// very slow a lot of regexes REWRITE COMPLETELY
	const sandboxImport = [];
	const allImportedNames = [];

	const importRegex = /^import .{0,}("|').{1,}("|')(;|)$/gm;
	const insideCurlyBracketsRegex = /{.{1,}}/gm;
	const fileNameRegex = /("|').{1,}("|');$/gm;
	const starAsNameRegex = /\*.{1,}(?=\sfrom)/gm;

	const imports = source.match(importRegex);

	if (imports) {
		for (let i = 0; i < imports.length; i++) {
			imports[i] = imports[i].replace(/\s+/g, ' ');
			const currentImport = {
				url: '',
				obj: []
			};
			//{camel_dependency, other_dependency}

			let names = imports[i].match(insideCurlyBracketsRegex);
			if (names && names[0]) {
				names = names[0];
				names = names.substr(1, names.length - 2).replace(/\s/g, '').split(',');
				currentImport.obj = names;
				allImportedNames.push(...names);
			}

			// * as name
			let name = imports[i].match(starAsNameRegex);
			if (name && name[0]) {
				name = name[0];
				name = name.substr(5);
				allImportedNames.push(name);
			}

			let fileName = imports[i].match(fileNameRegex);
			if (fileName[0]) {
				fileName = fileName[0];
				currentImport.url = fileName.substr(1, fileName.length - 3);
			}
			sandboxImport.push(currentImport);
		}
	}

	let res = source.replace(importRegex, '// $&');

	// EXPORTS

	//export { name1, name2, …, nameN };
	const exportCurlyBracketRegex = /export\s{1,}{.{1,}}/g;
	res = res.replace(exportCurlyBracketRegex, (str, index) => {
		let cur = str.match(insideCurlyBracketsRegex);
		if (!cur || !cur[0])
			return str;
		cur = cur[0].substr(1, cur[0].length - 2).replace(/\s/g, '').split(',');
		let res = '';
		for (let i = 0; i < cur.length; i++) {
			res += `sandbox_exports.${cur[i]} = ${cur[i]}\n`;
		}
		return res;
	});

	//export let name1


	res = `
	sandbox_import(${JSON.stringify(sandboxImport)}
	, function (${allImportedNames.join(', ')}) {
	${res};
	});`;
	return res;


};

const stripComments = (source) => {
	return source.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
};

const findAllRegexp = (source) => {
	return source.match(/\/\//g);
};

const findAllWhile = (source, needle) => {
	const res = [];
	let cur = -1;

	do {
		cur = source.indexOf(needle, cur + 1);
		res.push(cur);
	} while (cur != -1);

	return res;
};

const genRandomCode = (length) => {
	let res = '';
	const stuff = ['//', '/*', '*/', '\n', '\'', '"'];
	for (let i = 0; i < length; i++) {
		res += i + stuff[Math.floor(Math.random() * stuff.length)];
	}
	return res;
};

const benchmark = () => {
	let curLength = 100;
	while (curLength <= 1000000) {
		console.log(`Generating string of length ${curLength}`);
		let curStr = genRandomCode(curLength);
		const t = Date.now();

		const res0 = findAllWhile(curStr, '//');
		const res1 = findAllWhile(curStr, '\n');
		const res2 = findAllWhile(curStr, '/*');
		const res3 = findAllWhile(curStr, '*/');
		const res4 = findAllWhile(curStr, '\'');
		const res5 = findAllWhile(curStr, '\"');

		console.log(`While time ${Date.now() - t}`);

		curLength *= 10;
	}
};