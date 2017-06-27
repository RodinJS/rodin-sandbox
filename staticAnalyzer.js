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

const commentNeedles = ['//', '\n', '/*', '*/'];
const scopeNeedles = ['{', '}'];


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

const findNeedles = (source, needles) => {
	const needlePositions = [];
	for (let i = 0; i < needles.length; i++) {
		needlePositions.push(... find(source, needles[i]));
	}
	needlePositions.sort((a, b) => a[0] - b[0]);
	return needlePositions;
};

//debugging stuff

const loadTHREEJS = (cb) => {
	ajax.get('https://cdnjs.cloudflare.com/ajax/libs/three.js/86/three.js', {}, source => {
		cb(source);
	})
};

//end

const reduce = (source, needles) => {
	const reducedSourceArray = new Array(needles.length);
	const reduceMap = [];

	for (let i = 0; i < needles.length; i++) {
		reducedSourceArray[i] = needles[i][1];
		for (let j = 0; j < reducedSourceArray[i].length; j++) {
			reduceMap.push(needles[i][0]);
		}
	}

	const reducedSource = reducedSourceArray.join('');
	return [reducedSource, reduceMap];
};

class StaticAnalyzer {
	constructor(source) {
		this.source = source;
		this._commentsAnalyzed = false;

	}

	analyzeComments() {
		const needles = findNeedles(this.source, commentNeedles);

		const [reducedSource, map] = reduce(this.source, needles);

		const reducedNeedles = findComments(reducedSource);

		this._comments = reducedNeedles.map(a => [map[a[0]], map[a[1] + 1] || this.source.length]);
		this._commentsAnalyzed = true;
	}

	isComment(index) {
		if (!this._commentsAnalyzed) {
			// not analyzed
			return -1;
		}
		// make this O(log(n)) with a set, maybe make it conditional even
		for (let i = 0; i < this._comments.length; i++) {
			if (this._comments[i][0] <= index && index <= this._comments[i][1]) {
				return true;
			}
		}
		return false;
	}
}