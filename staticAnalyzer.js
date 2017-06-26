const find = (source, needle, method = 'indexOf') => {
	const res = [];
	let cur = -1;

	do {
		cur = source[method](needle, cur + 1);
		if (cur === -1)
			break;
		res.push([cur, needle]);
	} while (true);

	return res;
};

const needles = ['//', '\n', '/*', '*/'];

const findComments = (source) => {
	//(/\*([^*]|(\*+[^*/]))*\*+/)|(//.*)
	//((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))
	const commentRegex = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/gm;
	const res = [];
	// not efficient at all CHANGE THIS
	source.replace(commentRegex, (...args) => {
		let i = 1;
		while (typeof args[i] !== 'number') i++;
		res.push([args[i], args[i] + args[0].length]);
		return '';
	});
	return res;
};

class StaticAnalyzer {
	constructor(source) {
		this.source = source;
		const needlePositions = [];
		for (let i = 0; i < needles.length; i++) {
			needlePositions.push(... find(this.source, needles[i]));
		}
		needlePositions.sort((a, b) => a[0] - b[0]);

		const reducedSourceArray = new Array(needlePositions.length);
		const reduceMap = [];

		for (let i = 0; i < needlePositions.length; i++) {
			reducedSourceArray[i] = needlePositions[i][1];
			for (let j = 0; j < reducedSourceArray[i].length; j++) {
				reduceMap.push(needlePositions[i][0]);
			}
		}

		const reducedSource = reducedSourceArray.join('');
		const reducedComments = findComments(reducedSource);

		this._comments = reducedComments.map(a => [reduceMap[a[0]], reduceMap[a[1] + 1] || this.source.length]);

		// console.log(reduceMap);
		// console.log(reducedSource);
		// console.log(reducedComments);
		// console.log(this._comments);
	}

	isComment(index) {
		// make this O(log(n)) with a set, maybe make it conditional even
		for (let i = 0; i < this._comments.length; i++) {
			if (this._comments[i][0] <= index && index <= this._comments[i][1]) {
				return true;
			}
		}
		return false;
	}
}