const transpileImports = (source) => {
	// very slow a lot of regexes REWRITE COMPLETELY
	const sandboxImport = [];
	const allImportedNames = [];

	const importRegex = /^import.{0,}("|').{1,}("|')(;|)/gm;
	const insideCurlyBracketsRegex = /{.{1,}}/gm;
	const fileNameRegex = /("|').{1,}("|')/gm;
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
			//{camel_dependency as some_other_stuff, other_dependency}
			let names = imports[i].match(insideCurlyBracketsRegex);
			if (names && names[0]) {
				names = names[0];
				names = names.substr(1, names.length - 2).split(',');
				const localNames = [];

				for (let j = 0; j < names.length; j++) {
					// doing indexOf then split takes extra cpu
					// do just indexof instead and then substr
					if (names[j].indexOf(' as ') !== -1) {
						const tmp = names[j].split('as');
						names[j] = tmp[0].replace(/\s/g, '');
						localNames.push(tmp[1].replace(/\s/g, ''));
					}
					else {
						names[j] = names[j].replace(/\s/g, '');
						localNames.push(names[j]);
					}
				}
				currentImport.obj = names;
				allImportedNames.push(...localNames);
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
				currentImport.url = fileName.substr(1, fileName.length - 2);
			}
			sandboxImport.push(currentImport);
		}
	}

	let res = source.replace(importRegex, '// $&');

	// EXPORTS

	// export { name1, name2, …, nameN };
	// export { variable1 as name1, variable2 as name2, …, nameN };
	const exportCurlyBracketRegex = /export\s{0,}{.{1,}}/g;
	res = res.replace(exportCurlyBracketRegex, (str, index) => {
		let cur = str.match(insideCurlyBracketsRegex);
		if (!cur || !cur[0])
			return str;
		cur = cur[0].substr(1, cur[0].length - 2).split(',');
		//.replace(/\s/g, '')
		let res = '';
		for (let i = 0; i < cur.length; i++) {
			if (cur[i].indexOf(' as ') !== -1) {
				const tmp = cur[i].split(' as ');
				res += `sandbox_exports.${tmp[1].replace(/\s/g, '')} = ${tmp[0].replace(/\s/g, '')}\n`;
			} else {
				cur[i] = cur[i].replace(/\s/g, '');
				res += `sandbox_exports.${cur[i]} = ${cur[i]}\n`;
			}
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