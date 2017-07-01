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

const commentNeedles = ['//', '\n', '/*', '*/', '\'', '"', '`', '${', '}', '/'];
const scopeNeedles = ['{', '}'];

const binarySearch = (intervals, index) => {
    let low = 0;
    let high = intervals.length - 1;
    let mid = NaN;
    while (low <= high) {
        mid = Math.floor((low + high) / 2);
        if (intervals[mid][0] <= index && index < intervals[mid][1]) return mid;
        else if (intervals[mid][1] < index) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
};


const findComments = (source) => {
    //(/\*([^*]|(\*+[^*/]))*\*+/)|(//.*)
    //((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))
    //const commentRegex = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/gm;


    const commentRegex = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.{0,})|(\'[^']{0,}[^\\]{0,1}\')|(\"[^"]{0,}[^\\]{0,1}\")|(\`.{0,}[^\\]{0,1}\$\{|\`\$\{)|(\}[^`]{0,}[^\\]{0,1}\`)|\/[^\/]{0,}[^\\]\/[gimX]{0,}(?=\s{0,}[;\,\)\=\+\-\.\n]|$))/gm;
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

const loadTHREEJS = (cb, isMin = false) => {
    ajax.get(`https://cdnjs.cloudflare.com/ajax/libs/three.js/86/three${isMin ? '.min' : ''}.js`, {}, source => {
        cb(source);
    })
};

const loadJQUERY = (cb, isMin = false) => {
    ajax.get(`https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery${isMin ? '.min' : ''}.js`, {}, source => {
        cb(source);
    })
};

const loadD3 = (cb, isMin = false) => {
    ajax.get(`https://cdnjs.cloudflare.com/ajax/libs/d3/4.9.1/d3${isMin ? '.min' : ''}.js`, {}, source => {
        cb(source);
    })
};

const loadOtherJS = (cb) => {
    ajax.get(`https://cdn.rodin.io/v0.0.7-dev/core/sculpt/Sculpt.js`, {}, source => {
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
        this._commentsAndStringsAnalyzed = false;

    }

    // analyzeCommentsAndStrings() {
    // 	const needles = findNeedles(this.source, commentNeedles);
    //
    // 	//const [reducedSource, map] = reduce(this.source, needles);
    // 	const reducedNeedles = findComments(this.source);
    // 	this._commentsAndStrings = reducedNeedles.map(a => [map[a[0]], map[a[1]] || this.source.length]);
    // 	this._commentsAndStringsAnalyzed = true;
    // }

    analyzeScopes() {
        const allNeedles = findNeedles(this.source, scopeNeedles);
        const needles = [];
        const length = allNeedles.length;

        for (let i = 0; i < length; i++) {
            if (!this.isCommentOrString(allNeedles[i][0])) {
                needles.push(allNeedles[i]);
            }
        }

        window.allNeedles = allNeedles;
        window.needles = needles;
    }

    analyzeCommentsAndStrings() {
        // const allNeedles = findNeedles(this.source, scopeNeedles);
        // const needles = [];
        // for (let i = 0; i < allNeedles.length; i++) {
        //     if (!this.isCommentOrString(allNeedles[i][0])) {
        //         needles.push(allNeedles[i]);
        //     }
        // }
        // window.allNeedles = allNeedles;
        // window.needles = needles;

        // if we have something like
        // / somefunction() // comemnt and stuff
        // some other stuff
        // this will start looking at / thinking its a regex
        // then stumble upon \n in the end of the line
        // dismiss the regex, and lose // comment in the middle

        const res = [];
        const instances = [];

        const s = {
            anything: 0,
            afterSlash: 1,
            string: 2,
            literalStringStart: 3,
            comment: 4,
            multilineComment: 5,
            regex: 6,
            literalStringEnd: 7
        };

        const charsBeforeRegex = ['=', '+', '-', '/', '*', '%', '(', ')', '[', ';', ':', '{', '}', '\n', '\r', ',', '!', '&', '|', '^'];
        const charsAfterRegex = ['=', '+', '-', '/', '*', '%', ')', ']', ';', ',', '}'];

        const wordsBeforeRegex = ['return', 'yield'];

        const length = this.source.length;
        let i = 0;
        let state = s.anything;
        let stringType = '"'.charCodeAt(0);
        let inLiteralString = false;

        let start = null;

        const regexPrefixCheck = () => {
            let j = i - 2;
            while (j >= 0 && (this.source.charCodeAt(j) === 32 || this.source.charCodeAt(j) === 10)) {
                j--;
            }
            if (j < 0) {
                return true;
            }

            if (charsBeforeRegex.indexOf(this.source.charAt(j)) === -1) {

                for (let g = 0; g < wordsBeforeRegex.length; g++) {
                    let m = 0;
                    const len = wordsBeforeRegex.length;
                    const cur = wordsBeforeRegex[g];
                    const curWordLen = wordsBeforeRegex[g].length;
                    while (m < curWordLen && cur.charCodeAt(curWordLen - m - 1) === this.source.charCodeAt(j - m)) {
                        m++;
                    }
                    if (m == curWordLen)
                        return true;
                }

                return false;
            }
            return true;
        };

        const regexSuffixCheck = () => {
            let j = i + 1;
            while (j < length && (this.source.charCodeAt(j) === 32 || this.source.charCodeAt(j) === 10)) {
                j++;
            }

            if (charsAfterRegex.indexOf(this.source.charAt(j)) === -1) {
                return false;
            }
            return true;
        };

        const saveResult = (end = i) => {
            instances.push(this.source.substring(start, end + 1));
            res.push([start, end + 1]);
        };

        while (i < length) {
            const cur = this.source.charCodeAt(i);

            switch (state) {
                case s.anything:
                    start = i;
                    if (cur === '/'.charCodeAt(0)) {
                        state = s.afterSlash;
                    } else if (cur === '"'.charCodeAt(0) || cur === '\''.charCodeAt(0)) {
                        state = s.string;
                        stringType = cur;
                    } else if (cur === '`'.charCodeAt(0)) {
                        state = s.literalStringStart;
                    } else if (inLiteralString && cur === '}'.charCodeAt(0)) {
                        state = s.literalStringEnd;
                        inLiteralString = false;
                    }

                    break;
                case s.afterSlash:
                    if (cur === '/'.charCodeAt(0)) {
                        state = s.comment;
                    } else if (cur === '*'.charCodeAt(0)) {
                        state = s.multilineComment;
                    } else if (regexPrefixCheck()) {
                        if (cur === '\\'.charCodeAt(0)) {
                            i++;
                        }
                        state = s.regex;
                    } else {
                        state = s.anything;
                    }
                    break;
                case s.comment:
                    if (cur === '\n'.charCodeAt(0) || i === length - 1) {
                        saveResult();
                        state = s.anything;
                    }
                    break;
                case s.multilineComment:
                    if (cur === '*'.charCodeAt(0) && this.source.charCodeAt(i + 1) === '/'.charCodeAt(0)) {
                        i++;
                        saveResult(i);
                        state = s.anything;
                    }
                    break;
                case s.regex:
                    if (cur === '\\'.charCodeAt(0)) {
                        i++;
                    } else if (cur === '/'.charCodeAt(0)) {
                        if (regexSuffixCheck()) {
                            saveResult();
                        }
                        else {
                            i--;
                        }
                        state = s.anything;
                    }
                    break;
                case s.string:
                    if (cur === '\\'.charCodeAt(0)) {
                        i++;
                    } else if (cur === stringType) {
                        saveResult();
                        state = s.anything;
                    }
                    break;
                case s.literalStringStart:
                    if (cur === '\\'.charCodeAt(0)) {
                        i++;
                    } else if (cur === '$'.charCodeAt(0) && this.source.charCodeAt(i + 1) === '{'.charCodeAt(0)) {
                        i++;
                        saveResult();
                        state = s.anything;
                        inLiteralString = true;
                    } else if (cur === '`'.charCodeAt(0)) {
                        saveResult();
                        state = s.anything;
                    }
                    break;
                case s.literalStringEnd:
                    if (cur === '\\'.charCodeAt(0)) {
                        i++;
                    } else if (cur === '`'.charCodeAt(0)) {
                        saveResult();
                        state = s.anything;
                    }
                    break;
            }
            i++;
        }

        console.log(res);
        console.log(instances);
        this._commentsAndStrings = res;
        this._commentsAndStringsAnalyzed = true;

        //return res;
    }

    isCommentOrString(index) {
        if (!this._commentsAndStringsAnalyzed) {
            // not analyzed
            return false;
        }

        // // make this O(log(n)) with a set, maybe make it conditional even
        // for (let i = 0; i < this._commentsAndStrings.length; i++) {
        // 	if (this._commentsAndStrings[i][0] <= index && index <= this._commentsAndStrings[i][1]) {
        // 		return true;
        // 	}
        // }
        // return false;

        return binarySearch(this._commentsAndStrings, index) !== -1;
    }
}

