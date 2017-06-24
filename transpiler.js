const transpile = (source) => {

};

const stripComments = (source) => {
	return source.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
};

const findAllRegexp = (source) => {
	return source.match(/\/\//g);
};

const findAllWhile = (source) => {
	const res = [];
	let cur = -1;

	do {
		cur = source.indexOf('//', cur + 1);
		res.push(cur);
	} while (cur != -1);

	return res;
};

const genRandomCode = (length) => {
	let res = '';
	for (let i = 0; i < length; i++) {
		res += i + '//';
	}
	return res;
};

const benchmark = () => {
	let curLength = 100;
	while (curLength <= 1000000) {
		console.log(`Generating string of length ${curLength}`);
		let curStr = genRandomCode(curLength);
		let t = Date.now();
		let res = findAllRegexp(curStr);
		console.log(`Regex time ${Date.now() - t}`);
		console.log(res);

		t = Date.now();
		res = findAllWhile(curStr);
		console.log(`While time ${Date.now() - t}`);
		console.log(res);
		curLength *= 10;
	}
};