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
        if (intervals[mid][0] <= index && index <= intervals[mid][1]) return mid;
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

    analyzeCommentsAndStrings() {
        const needles = findNeedles(this.source, commentNeedles);

        //const [reducedSource, map] = reduce(this.source, needles);
        const reducedNeedles = findComments(this.source);
        this._commentsAndStrings = reducedNeedles.map(a => [map[a[0]], map[a[1]] || this.source.length]);
        this._commentsAndStringsAnalyzed = true;
    }

    analyzeScopes() {
        // const allNeedles = findNeedles(this.source, scopeNeedles);
        // const needles = [];
        // for (let i = 0; i < allNeedles.length; i++) {
        //     if (!this.isCommentOrString(allNeedles[i][0])) {
        //         needles.push(allNeedles[i]);
        //     }
        // }
        // window.allNeedles = allNeedles;
        // window.needles = needles;

        const behindChars = ['=', '+', '-', '/', '*', '%', '(', ')', ';', ':', '{', '}', '\n', '\r', ','];
        const forwardChars = ['+'];

        let state = 0;
        let start = null;
        const res = [];

        const s = {
            anything: 0,
            slash: 1,
            afterSlash: 2,
            lookbehind: 3,
            end: 4,
            singleQuoteString: 5,
            doubleQuoteString: 6,
            singleLineComment: 7,
            multiLineComment: 8,
        };
        const length = this.source.length;
        let i = 0;

        const singleQuote = "'";
        const doubleQuote = '"';

        while (i < length) {
            const cur = this.source.charAt(i);
            if (cur === '\\') {
                i += 2;
                continue;
            }

            switch (state) {
                case s.anything: // anything
                    if (cur === '/') {
                        start = i + 1;
                        state = s.slash;
                    }
                    if (cur === singleQuote) {
                        start = i + 1;
                        state = s.singleQuoteString;
                    }
                    if (cur === doubleQuote) {
                        start = i + 1;
                        state = s.doubleQuoteString;
                    }

                    break;
                case s.slash: // single /
                    if (cur === '/') {
                        //state = s.anything;
                        state = s.singleLineComment;
                        break;
                    }
                    if (cur === '*') {
                        state = s.multiLineComment;
                        break;
                    }
                    else {
                        state = s.lookbehind;
                    }

                case s.lookbehind:
                    let j = i - 2;
                    while (j >= 0 && this.source.charCodeAt(j) === 32) {
                        j--;
                    }
                    if (j < 0) {
                        state = s.afterSlash;
                    }

                    if (behindChars.indexOf(this.source.charAt(j)) === -1) {
                        state = s.anything;
                    } else {
                        state = s.afterSlash;
                    }


                    break;
                case s.afterSlash: // anything after /

                    if (cur === '/') {
                        state = s.end;
                    }

                    if (cur === '\n') {
                        state = s.anything;
                    }
                    break;
                case s.end:
                    // check forward;
                    res.push(this.source.substring(start - 1, i));
                    state = s.anything;
                    break;

                case s.singleQuoteString:
                    if (cur === singleQuote) {
                        state = s.end;
                    }
                    if (cur === '\n') {
                        state = s.anything;
                    }

                    break;

                case s.doubleQuoteString:
                    if (cur === doubleQuote) {
                        state = s.end;
                    }
                    if (cur === '\n') {
                        state = s.anything;
                    }

                    break;
                case s.singleLineComment:
                    if (cur === '\n') {
                        state = s.end;
                    }
                    break;

                case s.multiLineComment:
                    if (cur === '*' && this.source.charAt(++i) === '/') {
                        state = s.end;
                    }
                    break;
            }

            i++;
        }

        console.log(res);
        return res;
    }

    isCommentOrString(index) {
        if (!this._commentsAndStringsAnalyzed) {
            // not analyzed
            return false;
        }

        // make this O(log(n)) with a set, maybe make it conditional even
        for (let i = 0; i < this._commentsAndStrings.length; i++) {
            if (this._commentsAndStrings[i][0] <= index && index <= this._commentsAndStrings[i][1]) {
                return true;
            }
        }
        return false;

        return binarySearch(this._commentsAndStrings, index) !== -1;
    }
}


