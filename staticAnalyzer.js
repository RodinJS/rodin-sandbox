let _ = undefined;

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

const binarySearch = (intervals, index, left = false) => {
    let low = 0;
    let high = intervals.length - 1;
    let mid = NaN;
    while (low <= high) {
        mid = Math.floor((low + high) / 2);
        if (intervals[mid][0] <= index && index < intervals[mid][1]) return mid;
        else if (intervals[mid][1] < index) low = mid + 1;
        else high = mid - 1;
    }

    if (left)
        return low;

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

const jsDelimiterChars = ['=', '+', '-', '/', '*', '%', '(', ')', '[', ';', ':', '{', '}', '\n', '\r', ',', '!', '&', '|', '^', '?', ' '];


class StaticAnalyzer {
    constructor(source) {
        this.source = source;
        this._commentsAndStringsAnalyzed = false;
        this._lca = null;
        this._es6Scopes = null;
        this._scopeData = [[], []];
        this._es5Scopes = null;

        this._es6ScopeGraph = null;
        this._es5ScopeGraph = null;

        this._closingScopesSorted = [[], []];
    }

    // analyzeCommentsAndStrings() {
    // 	const needles = findNeedles(this.source, commentNeedles);
    //
    // 	//const [reducedSource, map] = reduce(this.source, needles);
    // 	const reducedNeedles = findComments(this.source);
    // 	this._commentsAndStrings = reducedNeedles.map(a => [map[a[0]], map[a[1]] || this.source.length]);
    // 	this._commentsAndStringsAnalyzed = true;
    // }

    // analyzeScopes() {
    //     const allNeedles = findNeedles(this.source, scopeNeedles);
    //     const needles = [];
    //     const length = allNeedles.length;
    //
    //     for (let i = 0; i < length; i++) {
    //         if (!this.isCommentOrString(allNeedles[i][0])) {
    //             needles.push(allNeedles[i]);
    //         }
    //     }
    //
    //     window.allNeedles = allNeedles;
    //     window.needles = needles;
    //
    //     this.scopes = needles.map(a => a[0]);
    // }

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

        const commentsAndStrings = [];
        const commentAndStringTypes = [];
        const instances = [];
        const es6Scopes = [[], []];
        //const es5Scopes = [[], []];

        const scopeGraph = [];

        const scopeStack = [];
        let scopeStackSize = 0;

        this._scopeString = '';


        this._commentsAndStrings = commentsAndStrings;
        this._commentsAndStringsTypes = commentAndStringTypes;
        this._commentsAndStringsAnalyzed = true;
        this._es6Scopes = es6Scopes;
        this._es6ScopeGraph = scopeGraph;


        const s = {
            anything: 0,
            afterSlash: 1,
            string: 2,
            literalString: 3,
            comment: 4,
            multilineComment: 5,
            regex: 6,
            squareBracketsRegex: 7
        };

        const jsOneLiners = ['if', 'for', 'while'];

        const charsBeforeRegex = ['=', '+', '-', '/', '*', '%', '(', '[', ';', ':', '{', '}', '\n', '\r', ',', '!', '&', '|', '^', '?', '>', '<'];
        const charsAfterRegex = ['=', '+', '-', '/', '*', '%', ')', ']', ';', ',', '}'];

        // const oneLinerSplitters = ['+', '-', '/', '*', '%', '[', ']', '(', ')', '{', '}', '.'].map(x => x.charCodeAt(0));


        const wordsBeforeRegex = ['return', 'yield', 'typeof', 'case', 'do', 'else'];

        const length = this.source.length;
        let i = 0;
        let state = s.anything;
        let stringType = '"'.charCodeAt(0);
        let inLiteralString = false;

        let start = null;
        let scopeStart = null;

        let literalStringStackSize = 0;

        const skipNonCode = (j) => {
            let resI = commentsAndStrings.length - 1;
            while (j >= 0 && (this.source.charCodeAt(j) <= 32 || /* || this.source.charCodeAt(j) === 10 || /!*this.source.charCodeAt(j) === 9 ||*!/*/
            (resI >= 0 && commentsAndStrings[resI][0] < j && commentsAndStrings[resI][1] > j))) {
                j--;
                if (resI >= 0 && commentsAndStrings[resI][0] < j && commentsAndStrings[resI][1] > j) {
                    j = commentsAndStrings[resI][0] - 1;
                    resI--;
                }
            }
            return j;
        };

        const regexPrefixCheck = () => {
            let j = skipNonCode(i - 2);

            if (j < 0) {
                return true;
            }

            if (this.source.charAt(j) === '+' && this.source.charAt(j - 1) === '+') {
                return false;
            }

            if (this.source.charAt(j) === '-' && this.source.charAt(j - 1) === '-') {
                return false;
            }

            if (charsBeforeRegex.indexOf(this.source.charAt(j)) === -1) {

                // probably not very efficient
                // review this and possibly rewrite

                // // join this with 'while' 'for' and other things its literally 10 lines bellow
                // for (let g = 0; g < wordsBeforeRegex.length; g++) {
                //     let m = 0;
                //     const len = wordsBeforeRegex.length;
                //     const cur = wordsBeforeRegex[g];
                //     const curWordLen = wordsBeforeRegex[g].length;
                //     while (m < curWordLen && cur.charCodeAt(curWordLen - m - 1) === this.source.charCodeAt(j - m)) {
                //         m++;
                //     }
                //     if (m == curWordLen)
                //         return true;
                // }
                let roundBrackets = false;
                if (this.source.charCodeAt(j) === ')'.charCodeAt(0)) {
                    roundBrackets = true;
                    let bracketStack = 1;
                    while (bracketStack) {
                        j = skipNonCode(--j);
                        if (this.source.charCodeAt(j) === '('.charCodeAt(0)) {
                            bracketStack--;
                        } else if (this.source.charCodeAt(j) === ')'.charCodeAt(0)) {
                            bracketStack++;
                        }
                    }
                    j--;
                }
                j = skipNonCode(j);

                const wordEnd = j + 1;

                while (j >= 0 && jsDelimiterChars.indexOf(this.source.charAt(j)) === -1) {
                    j--;
                }
                const wordStart = j + 1;
                //console.log(this.source.substring(wordStart, wordEnd));

                // refactor this if, better ways to write it as a single expression
                if (roundBrackets && jsOneLiners.indexOf(this.source.substring(wordStart, wordEnd)) !== -1) {
                    return true;
                } else if (!roundBrackets && wordsBeforeRegex.indexOf(this.source.substring(wordStart, wordEnd)) !== -1) {
                    return true;
                }

                return false;
            }
            return true;
        };

        const es5Scopes = ['function', 'function*'];

        const scopeHandles = {}, scopeGraphHandles = {};

        scopeHandles[StaticAnalyzer.scopeTypes.es5] = this._es5Scopes;
        scopeHandles[StaticAnalyzer.scopeTypes.es6] = this._es6Scopes;

        scopeGraphHandles[StaticAnalyzer.scopeTypes.es5] = this._es5ScopeGraph;
        scopeGraphHandles[StaticAnalyzer.scopeTypes.es6] = this._es6ScopeGraph;


        const sourceContainsFrom = (arr, j) => {
            const len = arr.length;
            let i = 0;
            let cur = '';
            let curLength = 0;
            while (i < len) {
                if (curLength !== arr[i].length) {
                    curLength = arr[i].length;
                    cur = this.source.substr(j - arr[i].length + 1, arr[i].length);
                }
                if (cur === arr[i]) {
                    return i;
                }

                i++;
            }
            return -1;
        };

        const bracketStack = [];

        const brackets = [
            '['.charCodeAt(0), '('.charCodeAt(0), '{'.charCodeAt(0), -1 /*single line scope*/,
            ']'.charCodeAt(0), ')'.charCodeAt(0), '}'.charCodeAt(0), -2 /*single line scope*/,
        ];


        //todo: one line arrow functions, for, if, while, do
        // const saveScope = (bracket, scopeType = StaticAnalyzer.scopeTypes.es6) => {
        //
        //     let isOpening = false;
        //     let scopeStart = i;
        //     let j = i;
        //
        //     // todo: make a debug flag for these things
        //     this._scopeString += String.fromCharCode(bracket);
        //
        //     switch (scopeType) {
        //         case StaticAnalyzer.scopeTypes.arrowFunction:
        //             // debugger;
        //             [i, _] = this.skipNonCode(i + 2);
        //             scopeStart = i;
        //             i++;
        //             let c = j - 1;
        //             c--;
        //             [c, _] = this.skipNonCode(c, -1); // add curCommentIndex
        //             let closingRoundBracket = c;
        //             let openingRoundBracket = null;
        //
        //             if (this.source.charCodeAt(c) !== ')'.charCodeAt(0)) {
        //                 closingRoundBracket++;
        //                 c = this.getWordFromIndex(c)[0];
        //                 // todo: figure out if this if j or j+1
        //                 openingRoundBracket = c;
        //             } else {
        //                 [c, _] = this.skipBrackets(c); //  add curCommentIndex
        //                 openingRoundBracket = c;
        //             }
        //
        //             scopeType = StaticAnalyzer.scopeTypes.arrowFunction;
        //
        //             if (this.source.charCodeAt(i - 1) !== '{'.charCodeAt(0)) {
        //                 scopeType = scopeType | StaticAnalyzer.scopeTypes.expression;
        //                 bracketStack.push(-1);
        //             }
        //
        //             this._scopeData.push([scopeType, [openingRoundBracket, closingRoundBracket]]);
        //
        //
        //             isOpening = true;
        //             break;
        //         case StaticAnalyzer.scopeTypes.expression:
        //             isOpening = false;
        //             bracketStack.pop();
        //             break;
        //     }
        //
        //     if (bracket === '{'.charCodeAt(0)) {
        //         bracketStack.push(bracket);
        //         isOpening = true;
        //         j = skipNonCode(i - 1);
        //
        //         // checking if the scope is a function
        //         if (this.source.charCodeAt(j) === ')'.charCodeAt(0)) {
        //             const closingRoundBracket = j;
        //
        //             [j, _] = this.skipBrackets(j);
        //             const openingRoundBracket = j;
        //
        //             let tmpI = 0;
        //
        //             while (tmpI++ < 2) {
        //                 j--;
        //                 [j, _] = this.skipNonCode(j, -1); // add curCommentIndex
        //                 const nextWord = this.getWordFromIndex(j);
        //                 const cur = this.source.substring(nextWord[0], nextWord[1]);
        //                 j = nextWord[0];
        //                 // const fcn = function(a,b,c){...}
        //                 if (es5Scopes.indexOf(cur) !== -1) {
        //                     scopeType = StaticAnalyzer.scopeTypes.function;
        //                     this._scopeData.push([scopeType, [openingRoundBracket, closingRoundBracket]]);
        //                     // scopeStart = j;
        //                 }
        //             }
        //
        //         }
        //
        //     }
        //
        //
        //     if (isOpening) {
        //         // we put everything in es6 scopes since it contains all other types
        //         // then we distinguish them later.
        //         const scopes = this._es6Scopes;
        //
        //         // add new scope we just found to the graph
        //         scopeGraph.push([]);
        //         // check if there is a scope which contains it
        //         if (scopeGraph[scopeStack[scopeStackSize - 1]]) {
        //             // push the current scope to its parent
        //             // note: es6Scopes[0].length without -1 because \
        //             // we haven't yet added the current one
        //             scopeGraph[scopeStack[scopeStackSize - 1]].push(es6Scopes[0].length);
        //         }
        //         // add both beginning and ending of the scope we found
        //         // the ending is NaN because we will fill it in later
        //         es6Scopes[0].push(scopeStart);
        //         es6Scopes[1].push(NaN);
        //         // check if our array has enough space to add an element
        //         if (scopeStack.length < scopeStackSize) {
        //             // if it does not use .push
        //             scopeStack.push(es6Scopes[0].length - 1);
        //         }
        //         else {
        //             // otherwise just set the element we need
        //             scopeStack[scopeStackSize] = es6Scopes[0].length - 1;
        //         }
        //         scopeStackSize++;
        //     } else {
        //         // change the value we put as NaN earlier
        //         es6Scopes[1][scopeStack[scopeStackSize - 1]] = i;
        //         this._closingScopesSorted[0].push(i);
        //         this._closingScopesSorted[1].push(scopeStack[scopeStackSize - 1]);
        //
        //         scopeStackSize--;
        //         bracketStack.pop();
        //     }
        //     console.log(scopeStart, scopeType.toString(2));
        //
        //     //es6Scopes.push([i, bracket]);
        // };

        const saveResult = (end = i) => {
            instances.push(this.source.substring(start, end + 1));
            commentsAndStrings.push([start, end + 1]);
            commentAndStringTypes.push(state);
        };

        let isOneLinerEnter = false;

        while (i < length) {
            const cur = this.source.charCodeAt(i);

            switch (state) {
                case s.anything:

                    // if (isOneLinerEnter && bracketStack[bracketStack.length - 1] === -1 &&
                    //     oneLinerSplitters.indexOf(this.source.charCodeAt(i)) === -1) {
                    //     isOneLinerEnter = false;
                    //     // todo: check if this saves one more character after the scope
                    //     saveScope(-2, StaticAnalyzer.scopeTypes.expression);
                    // }

                    start = i;
                    if (cur === '/'.charCodeAt(0)) {
                        state = s.afterSlash;
                    } else if (cur === '"'.charCodeAt(0) || cur === '\''.charCodeAt(0)) {
                        state = s.string;
                        stringType = cur;
                    } else if (cur === '`'.charCodeAt(0)) {
                        literalStringStackSize++;
                        state = s.literalString;
                    } else if (inLiteralString && cur === '}'.charCodeAt(0)) {
                        state = s.literalString;
                        inLiteralString = false;
                        // } else if (cur === '{'.charCodeAt(0)) {
                        //     saveScope(cur);
                        // } else if (cur === '}'.charCodeAt(0)) {
                        //     saveScope(cur);
                        // } else if (cur === '='.charCodeAt(0) && this.source.charCodeAt(i + 1) === '>'.charCodeAt(0)) {
                        //     saveScope(cur, StaticAnalyzer.scopeTypes.arrowFunction);
                        // } else if (bracketStack[bracketStack.length - 1] === -1) {
                        //     if (cur === ';'.charCodeAt(0)) {
                        //         saveScope(-2, StaticAnalyzer.scopeTypes.expression); // one line code has come to an end
                        //     } else if (cur === '\n'.charCodeAt(0)) {
                        //         let tmp = this.skipNonCode(i, -1)[0];
                        //         // todo: this doesn't work if a oneliner is directly in the end of the file
                        //         if (oneLinerSplitters.indexOf(this.source.charCodeAt(tmp)) === -1) {
                        //             // todo: figure out how to skip code here so we can check after \n
                        //             saveScope(-2, StaticAnalyzer.scopeTypes.expression); // one line code has come to an end
                        //             // isOneLinerEnter = true;
                        //         }
                        //     }
                        // } else {
                        //     const bracket = brackets.indexOf(cur);
                        //     if (bracket !== -1) {
                        //         if (bracket < brackets.length / 2) { // opening
                        //             bracketStack.push(bracket);
                        //         }
                        //         else { // closing
                        //             bracketStack.pop();
                        //         }
                        //     }
                        // }
                    }

                    break;
                case s.afterSlash:
                    if (cur === '/'.charCodeAt(0)) {
                        state = s.comment;
                    } else if (cur === '*'.charCodeAt(0)) {
                        state = s.multilineComment;
                    } else if (regexPrefixCheck()) {
                        // if (cur === '\\'.charCodeAt(0)) {
                        //     i++;
                        // }
                        state = s.regex;
                        i -= 1;
                    } else {
                        state = s.anything;
                        i -= 1;
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
                    } else if (cur === '\n'.charCodeAt(0)) {
                        state = s.anything;
                        i = start;
                    } else if (cur === '['.charCodeAt(0)) {
                        state = s.squareBracketsRegex;
                    } else if (cur === '/'.charCodeAt(0)) {
                        // if (regexSuffixCheck()) {
                        //     saveResult();
                        // }
                        // else {
                        //     i = start;
                        // }
                        saveResult();
                        state = s.anything;
                    }
                    break;
                case s.squareBracketsRegex:
                    if (cur === '\\'.charCodeAt(0)) {
                        i++;
                    } else if (cur === ']'.charCodeAt(0)) {
                        state = s.regex;
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
                case s.literalString:
                    // ` camels ${10 + `${20}`} `
                    // this is also valid reflow to work
                    if (cur === '\\'.charCodeAt(0)) {
                        i++;
                    } else if (cur === '$'.charCodeAt(0) && this.source.charCodeAt(i + 1) === '{'.charCodeAt(0)) {
                        i++;
                        saveResult();
                        state = s.anything;
                        inLiteralString = true;
                    } else if (cur === '`'.charCodeAt(0)) {
                        saveResult();
                        literalStringStackSize--;
                        if (literalStringStackSize) {
                            inLiteralString = true;
                        }
                        state = s.anything;
                    }
                    break;
            }
            i++;
        }

        //console.log(commentsAndStrings);
        //console.log(instances);
        //window.instances = instances;

        //return commentsAndStrings;
    }

    analyzeScopes() {
        const n = this.source.length;
        let i = 0;

        const es6Scopes = this._es6Scopes;
        const scopeGraph = this._es6ScopeGraph;

        const scopeStack = [];
        let scopeStackSize = 0;

        const bracketStack = [];

        const s = {
            anything: 0
        };

        let state = s.anything;
        let curCommentIndex = 0;
        const oneLinerSplitters = ['+', '-', '/', '*', '%', '[', ']', '}', '(', '.'].map(x => x.charCodeAt(0));
        const es5Functions = ['function', 'function*'];

        const expressionSplitters = [',', '+', '-', '/', '*', '%', '[', ']', '}', '(', '.'].map(x => x.charCodeAt(0));
        const statementSplitters = ['+', '-', '/', '*', '%', '[', ']', '}', '(', '.'].map(x => x.charCodeAt(0));

        //todo: one line arrow functions, for, if, while, do
        const saveScope = (bracket, scopeType = StaticAnalyzer.scopeTypes.es6) => {

            let isOpening = false;
            let scopeStart = i;
            let scopeEnd = i;
            let j = i;
            // cur comment index!!!!!
            let cci = null;
            let c = null;
            // todo: make a debug flag for these things
            this._scopeString += String.fromCharCode(bracket);

            switch (scopeType) {
                case StaticAnalyzer.scopeTypes.arrowFunction:
                    // debugger;
                    [i, _] = this.skipNonCode(i + 2);
                    scopeStart = i;
                    i++;
                    c = j - 1;
                    c--;
                    [c, cci] = this.skipNonCode(c, -1); // add curCommentIndex
                    let closingRoundBracket = c;
                    let openingRoundBracket = null;

                    // a=>{}
                    if (this.source.charCodeAt(c) !== ')'.charCodeAt(0)) {
                        closingRoundBracket++;
                        c = this.getWordFromIndex(c)[0];
                        // todo: figure out if this if j or j+1
                        openingRoundBracket = c;
                    } else {
                        // (a,b,c)=>
                        [c, cci] = this.skipBrackets(c, cci); //  add curCommentIndex
                        openingRoundBracket = c;
                    }

                    // scopeType = StaticAnalyzer.scopeTypes.arrowFunction;

                    // if (this.source.charCodeAt(i - 1) !== '('.charCodeAt(0)) {
                    //     scopeType = scopeType | StaticAnalyzer.scopeTypes.expression;
                    //     bracket = -3; // round bracket
                    // } else
                    if (this.source.charCodeAt(i - 1) !== '{'.charCodeAt(0)) {
                        // revert back one character so things like ({}) will work
                        i -= 2;
                        scopeType = scopeType | StaticAnalyzer.scopeTypes.expression;
                        bracket = -1; // no bracket at all
                    }

                    this._scopeData.push([scopeType, [openingRoundBracket, closingRoundBracket]]);


                    isOpening = true;
                    break;
                case StaticAnalyzer.scopeTypes.singleStatement:
                case StaticAnalyzer.scopeTypes.expression:
                    isOpening = false;
                    scopeEnd = i - 1;
                    bracketStack.pop();
                    break;
                case StaticAnalyzer.scopeTypes.for:
                    isOpening = true;
                    scopeStart = i;
                    [i, cci] = this.skipNonCode(i + 3);
                    [i, _] = this.skipBrackets(i, cci);
                    [i, cci] = this.skipNonCode(++i);

                    i++;

                    if (this.source.charCodeAt(i - 1) !== '{'.charCodeAt(0)) {
                        // revert back one character so things like ({}) will work
                        i -= 2;
                        scopeType = scopeType | StaticAnalyzer.scopeTypes.singleStatement;
                        bracket = -3; // no bracket at all, but a statement instead of an expression
                    }

                    this._scopeData.push([scopeType, []]);
                    break;
            }


            if (bracket === '{'.charCodeAt(0)) {
                // bracketStack.push(bracket);
                isOpening = true;
                [j, _] = this.skipNonCode(i - 1, -1);

                // checking if the scope is a function
                if (this.source.charCodeAt(j) === ')'.charCodeAt(0)) {
                    const closingRoundBracket = j;

                    [j, _] = this.skipBrackets(j);
                    const openingRoundBracket = j;

                    let tmpI = 0;

                    while (tmpI++ < 2) {
                        j--;
                        [j, _] = this.skipNonCode(j, -1); // add curCommentIndex
                        const nextWord = this.getWordFromIndex(j);
                        const cur = this.source.substring(nextWord[0], nextWord[1]);
                        j = nextWord[0];
                        // const fcn = function(a,b,c){...}
                        if (es5Functions.indexOf(cur) !== -1) {
                            scopeType = StaticAnalyzer.scopeTypes.function;
                            this._scopeData.push([scopeType, [openingRoundBracket, closingRoundBracket]]);
                            // scopeStart = j;
                        }
                    }

                }

            }


            if (isOpening) {
                bracketStack.push(bracket);

                // we put everything in es6 scopes since it contains all other types
                // then we distinguish them later.
                const scopes = this._es6Scopes;

                // add new scope we just found to the graph
                scopeGraph.push([]);
                // check if there is a scope which contains it
                if (scopeGraph[scopeStack[scopeStackSize - 1]]) {
                    // push the current scope to its parent
                    // note: es6Scopes[0].length without -1 because \
                    // we haven't yet added the current one
                    scopeGraph[scopeStack[scopeStackSize - 1]].push(es6Scopes[0].length);
                }
                // add both beginning and ending of the scope we found
                // the ending is NaN because we will fill it in later
                es6Scopes[0].push(scopeStart);
                es6Scopes[1].push(NaN);
                // check if our array has enough space to add an element
                if (scopeStack.length < scopeStackSize) {
                    // if it does not use .push
                    scopeStack.push(es6Scopes[0].length - 1);
                }
                else {
                    // otherwise just set the element we need
                    scopeStack[scopeStackSize] = es6Scopes[0].length - 1;
                }
                scopeStackSize++;
            } else {
                // change the value we put as NaN earlier
                es6Scopes[1][scopeStack[scopeStackSize - 1]] = scopeEnd;
                this._closingScopesSorted[0].push(scopeEnd);
                this._closingScopesSorted[1].push(scopeStack[scopeStackSize - 1]);

                scopeStackSize--;
                bracketStack.pop();
            }
            // console.log(scopeStart, scopeType.toString(2));

            //es6Scopes.push([i, bracket]);
        };

        while (i < n) {
            const cur = this.source.charCodeAt(i);

            if (cur === '{'.charCodeAt(0)) {
                saveScope(cur);
            } else if (cur === '}'.charCodeAt(0)) {
                saveScope(cur);
            } else if (cur === '='.charCodeAt(0) && this.source.charCodeAt(i + 1) === '>'.charCodeAt(0)) {
                saveScope(cur, StaticAnalyzer.scopeTypes.arrowFunction);
            } else if (cur === 'f'.charCodeAt(0) && this.source.charCodeAt(i + 1) === 'o'.charCodeAt(0) && this.source.charCodeAt(i + 2) === 'r'.charCodeAt(0)) {
                saveScope(cur, StaticAnalyzer.scopeTypes.for);
            } else {
                if (cur === '('.charCodeAt(0) || cur === '['.charCodeAt(0)) {
                    bracketStack.push(cur);
                } else if (cur === ')'.charCodeAt(0) || cur === ']'.charCodeAt(0)) {
                    bracketStack.pop();
                }


                // ++ -- needs fixing
                if (bracketStack[bracketStack.length - 1] === -1) {
                    if (cur === ';'.charCodeAt(0) || cur === ','.charCodeAt(0)) {
                        saveScope(-2, StaticAnalyzer.scopeTypes.expression);
                    } else if (cur === '\n'.charCodeAt(0)) {
                        let a = i, b = i;
                        [a, _] = this.skipNonCode(a, -1);
                        [b, _] = this.skipNonCode(b, 1);
                        if (statementSplitters.indexOf(this.source.charCodeAt(a)) === -1 &&
                            statementSplitters.indexOf(this.source.charCodeAt(b)) === -1) {
                            saveScope(-2, StaticAnalyzer.scopeTypes.expression);
                        }

                    }
                }

                if (bracketStack[bracketStack.length - 1] === -3) {
                    if (cur === ';'.charCodeAt(0)) {
                        saveScope(-2, StaticAnalyzer.scopeTypes.singleStatement);
                    } else if (cur === '\n'.charCodeAt(0)) {
                        let a = i, b = i;
                        [a, _] = this.skipNonCode(a, -1);
                        [b, _] = this.skipNonCode(b, 1);
                        if (expressionSplitters.indexOf(this.source.charCodeAt(a)) === -1 &&
                            expressionSplitters.indexOf(this.source.charCodeAt(b)) === -1) {
                            saveScope(-2, StaticAnalyzer.scopeTypes.singleStatement);
                        }

                    }
                }
            }

            [i, curCommentIndex] = this.skipNonCode(++i, 1, curCommentIndex, true, true, false);
            // i++;

        }
    }

    isCommentOrString(index) {
        if (!this._commentsAndStringsAnalyzed) {
            // not analyzed
            return false;
        }

        // make this O(log(n)) with a set, maybe make it conditional even
        // for (let i = 0; i < this._commentsAndStrings.length; i++) {
        //     if (this._commentsAndStrings[i][0] <= index && index <= this._commentsAndStrings[i][1]) {
        //         return true;
        //     }
        // }
        // return false;

        return binarySearch(this._commentsAndStrings, index) !== -1;
    }

    // todo: add a direction to this
    skipNonCode(j, direction = 1, curCommentIndex = binarySearch(this._commentsAndStrings, j, true), skipComments = true, skipWhitespace = true, skipNewLine = true) {
        if (isNaN(curCommentIndex))
            curCommentIndex = binarySearch(this._commentsAndStrings, j, true);

        while (j < this.source.length && j >= 0) {
            if (skipComments && curCommentIndex >= 0 && curCommentIndex < this._commentsAndStrings.length &&
                this._commentsAndStrings[curCommentIndex][0] <= j && j <= this._commentsAndStrings[curCommentIndex][1]) {

                j = this._commentsAndStrings[curCommentIndex][direction === 1 ? 1 : 0];
                if (direction === -1) {
                    j--;
                }

                curCommentIndex += direction;
                continue;
            }

            // if (this.source.charCodeAt(j) <= 32) {
            //     j += direction;
            //     continue;
            // }

            if ((skipNewLine && this.source.charCodeAt(j) === 10) || (skipWhitespace && this.source.charCodeAt(j) <= 32 && this.source.charCodeAt(j) !== 10)) {
                j += direction;
                continue;
            }

            break;
        }

        return [j, curCommentIndex];
    };

    skipBrackets(j, curCommentIndex = binarySearch(this._commentsAndStrings, j, true)) {
        let oldJ = j;
        const bracket = this.source.charCodeAt(j);

        const isOpening = ['{'.charCodeAt(0), '('.charCodeAt(0), '['.charCodeAt(0)].indexOf(bracket) !== -1;
        const isClosing = ['}'.charCodeAt(0), ')'.charCodeAt(0), ']'.charCodeAt(0)].indexOf(bracket) !== -1;

        if (!isOpening && !isClosing)
            return [oldJ, curCommentIndex];

        if (bracket === '{'.charCodeAt(0)) {
            curCommentIndex = NaN;
            return [j, this._es6Scopes[1][this._es6Scopes[0].indexOf(j)]];
        } else if (bracket === '}'.charCodeAt(0)) {
            curCommentIndex = NaN;
            return [j, this._es6Scopes[0][this._es6Scopes[1].indexOf(j)]];
        }

        let reverseBracket;
        if (bracket === '('.charCodeAt(0))
            reverseBracket = ')'.charCodeAt(0);

        if (bracket === ')'.charCodeAt(0))
            reverseBracket = '('.charCodeAt(0);

        if (bracket === '['.charCodeAt(0))
            reverseBracket = ']'.charCodeAt(0);

        if (bracket === ']'.charCodeAt(0))
            reverseBracket = '['.charCodeAt(0);

        let stack = 1;
        const direction = isOpening ? 1 : -1;
        j += direction;
        while (j < this.source.length && j >= 0) {
            [j, curCommentIndex] = this.skipNonCode(j, direction);

            if (bracket === this.source.charCodeAt(j))
                stack++;

            if (reverseBracket === this.source.charCodeAt(j)) {
                stack--;

                if (stack === 0)
                    return [j, curCommentIndex];
            }

            j += direction;
        }

        return [oldJ, curCommentIndex];
    };

    getWordFromIndex(i) {
        if (jsDelimiterChars.indexOf(this.source.charAt(i)) !== -1)
            return [NaN, NaN];

        if (this.isCommentOrString(i))
            return [NaN, NaN];

        let start = i;
        let end = i;

        let currChar = this.source.charAt(end);
        while (jsDelimiterChars.indexOf(currChar) === -1 && end < this.source.length) {
            end++;
            currChar = this.source.charAt(end);
        }

        currChar = this.source.charAt(start);
        while (jsDelimiterChars.indexOf(currChar) === -1 && start >= 0) {
            start--;
            currChar = this.source.charAt(start);
        }

        return [start + 1, end];
    }

    nextString(j) {
        let curCommentIndex = binarySearch(this._commentsAndStrings, j, true);

        while (j < this.source.length) {
            if (curCommentIndex >= 0 && curCommentIndex < this._commentsAndStrings.length &&
                this._commentsAndStrings[curCommentIndex][0] <= j && j <= this._commentsAndStrings[curCommentIndex][1] &&
                (this._commentsAndStringsTypes[curCommentIndex] === 4 || this._commentsAndStringsTypes[curCommentIndex] === 5)) {

                j = this._commentsAndStrings[curCommentIndex][1];
                curCommentIndex++;
                continue;
            }

            if (this.source.charCodeAt(j) <= 32) {
                j++;
                continue;
            }

            break;
        }

        return curCommentIndex;
    };

    findExports() {
        const rx = /(?:^|\s|\/|\)|\[|;|{|})(export)(?={|\s|\/)/gm;
        let match;
        const exportBeginnings = [];
        while ((match = rx.exec(this.source))) {
            let curPos = match[0].indexOf('export') + match.index;
            if (this.isCommentOrString(curPos)) {
                continue;
            }
            exportBeginnings.push(curPos);
        }

        let curCommentIndex = NaN;

        const nextString = (j) => {
            curCommentIndex = binarySearch(this._commentsAndStrings, j, true);

            while (j < this.source.length) {
                if (curCommentIndex >= 0 && curCommentIndex < this._commentsAndStrings.length &&
                    this._commentsAndStrings[curCommentIndex][0] <= j && j <= this._commentsAndStrings[curCommentIndex][1] &&
                    (this._commentsAndStringsTypes[curCommentIndex] === 4 || this._commentsAndStringsTypes[curCommentIndex] === 5)) {

                    j = this._commentsAndStrings[curCommentIndex][1];
                    curCommentIndex++;
                    continue;
                }

                if (this.source.charCodeAt(j) <= 32) {
                    j++;
                    continue;
                }

                break;
            }

            return curCommentIndex;
        };

        const analizeExport = (i, exportIndex) => {
            i += 6;
            const exportBeginning = i;

            const states = {
                start: 0,
                brackets: {
                    anything: 10,
                    var: 11,
                    as: 12,
                    label: 13
                },
                lcv: {
                    anything: 61,
                    var: 62,
                    afterEqual: 63
                },
                fc: {
                    anything: 40,
                    var: 41
                },
                from: 50,
                end: 100
            };

            const memory = {
                currVar: new Array(1000),
                currVarLength: 0,
                currLabel: new Array(1000),
                currLabelLength: 0,
                exportType: '',
                nonCodeSkipped: false,
                from: null
            };

            const currExportsArr = {
                exportIndexes: [],
                exportBeginnings: [],
                names: [],
                labels: [],
                isBrackets: [],
                isLet: [],
                isConst: [],
                isVar: [],
                isClass: [],
                isFunction: [],
                isGeneratorFunction: [],
                isAll: [],
                from: [],
            };

            const saveVar = () => {
                const name = memory.currVar.join('');
                const label = memory.currLabelLength > 0 ? memory.currLabel.join('') : name;

                memory.currVar.fill(undefined);
                memory.currLabel.fill(undefined);
                memory.currVarLength = 0;
                memory.currLabelLength = 0;

                currExportsArr.exportIndexes.push(exportIndex);
                currExportsArr.exportBeginnings.push(exportBeginning);
                currExportsArr.names.push(name);
                currExportsArr.labels.push(label || name);
                currExportsArr.isBrackets.push(memory.exportType === 'brackets');
                currExportsArr.isLet.push(memory.exportType === 'let');
                currExportsArr.isConst.push(memory.exportType === 'const');
                currExportsArr.isVar.push(memory.exportType === 'var');
                currExportsArr.isClass.push(memory.exportType === 'class');
                currExportsArr.isFunction.push(memory.exportType === 'function');
                currExportsArr.isGeneratorFunction.push(memory.exportType === 'function*');
                currExportsArr.isAll.push(memory.exportType === '*');
                currExportsArr.from.push(memory.from);
            };

            const collectResults = () => {
                if (memory.from)
                    for (let i = 0; i < currExportsArr.from.length; i++)
                        currExportsArr.from[i] = memory.from

                return currExportsArr;
            };

            let state = states.start;

            while (i < this.source.length) {
                let j;
                [j, curCommentIndex] = this.skipNonCode(i);
                memory.nonCodeSkipped = i !== j;
                i = j;

                const currChar = this.source.charAt(i);

                switch (state) {
                    /**
                     * Checks export type
                     */
                    case states.start:
                        if ('{'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            state = states.brackets.anything;
                            break;
                        }

                        if ('*'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            memory.exportType = '*';
                            state = states.from;
                            saveVar();
                            break;
                        }

                        if ('let' === this.source.substr(i, 3) && jsDelimiterChars.indexOf(this.source.charAt(i + 3)) !== -1) {
                            memory.exportType = 'let';
                            i += 2;
                            state = states.lcv.anything;
                            break;
                        }

                        if ('var' === this.source.substr(i, 3) && jsDelimiterChars.indexOf(this.source.charAt(i + 3)) !== -1) {
                            memory.exportType = 'var';
                            i += 2;
                            state = states.lcv.anything;
                            break;
                        }

                        if ('const' === this.source.substr(i, 5) && jsDelimiterChars.indexOf(this.source.charAt(i + 5)) !== -1) {
                            memory.exportType = 'const';
                            i += 4;
                            state = states.lcv.anything;
                            break;
                        }

                        if ('function' === this.source.substr(i, 8) && jsDelimiterChars.indexOf(this.source.charAt(i + 8)) !== -1) {
                            memory.exportType = 'function';
                            i += 7;
                            let j;
                            [j, curCommentIndex] = this.skipNonCode(i + 1);
                            if ('*'.charCodeAt(0) === this.source.charCodeAt(j)) {
                                i = j;
                                memory.exportType = 'function*';
                            }

                            state = states.fc.anything;
                            break;
                        }

                        if ('class' === this.source.substr(i, 5) && jsDelimiterChars.indexOf(this.source.charAt(i + 5)) !== -1) {
                            memory.exportType = 'class';
                            i += 4;
                            state = states.fc.anything;
                            break;
                        }

                        if ('default' === this.source.substr(i, 7) && jsDelimiterChars.indexOf(this.source.charAt(i + 7)) !== -1) {
                            memory.exportType = 'default';
                            state = states.end;
                            break;
                        }

                        break;

                    /**
                     * EXPORT TYPE Brackets
                     */
                    case states.brackets.anything:
                        memory.exportType = 'brackets';
                        i--;
                        state = states.brackets.var;
                        break;

                    case states.brackets.var:
                        [i, curCommentIndex] = this.skipNonCode(i);

                        if (memory.nonCodeSkipped && 'a'.charCodeAt(0) === this.source.charCodeAt(i) && 's'.charCodeAt(0) === this.source.charCodeAt(i + 1)) {
                            i += 2;
                            state = states.brackets.label;
                            break;
                        }

                        if (','.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            i++;
                            state = states.brackets.anything;
                            break;
                        }

                        if ('}'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.from;
                            break;
                        }

                        memory.currVar[memory.currVarLength++] = currChar;
                        break;

                    case states.brackets.label:
                        [i, curCommentIndex] = this.skipNonCode(i);

                        if (','.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            i++;
                            state = states.brackets.anything;
                            break;
                        }

                        if ('}'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.from;
                            break;
                        }

                        memory.currLabel[memory.currLabelLength++] = currChar;
                        break;


                    /**
                     * EXPORT TYPE Let
                     * EXPORT TYPE Const
                     * EXPORT TYPE Var
                     */
                    case states.lcv.anything:
                        i -= 1;
                        state = states.lcv.var;
                        break;

                    case states.lcv.var:
                        if ('='.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.lcv.afterEqual;
                            break;
                        }

                        if (','.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.lcv.anything;
                            break;
                        }

                        if (';'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.end;
                            break;
                        }

                        memory.currVar[memory.currVarLength++] = currChar;
                        break;

                    case states.lcv.afterEqual:
                        [i, curCommentIndex] = this.skipBrackets(i, curCommentIndex);

                        if (','.charCodeAt(0) === currChar.charCodeAt(0)) {
                            state = states.lcv.anything;
                            break;
                        }

                        if (';'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            state = states.end;
                            break;
                        }

                        break;

                    /**
                     * EXPORT TYPE Function
                     */
                    case states.fc.anything:
                        i -= 1;
                        state = states.fc.var;
                        break;

                    case states.fc.var:
                        if (memory.nonCodeSkipped || '('.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.end;
                            break;
                        }

                        memory.currVar[memory.currVarLength++] = currChar;
                        break;

                    /**
                     * FROM
                     */
                    case states.from:
                        if (this.source.substr(i, 4) === 'from') {
                            i += 4;
                            const url = this._commentsAndStrings[nextString(i)];
                            memory.from = this.source.substring(url[0], url[1]);
                        }

                        state = states.end;
                        break;

                    /**
                     * Return results
                     */
                    case states.end:
                        return collectResults();
                }

                i++;
            }

            return collectResults();
        };

        const exports = {
            exportIndexes: [],
            exportBeginnings: [],
            names: [],
            labels: [],
            isBrackets: [],
            isLet: [],
            isVar: [],
            isConst: [],
            isClass: [],
            isFunction: [],
            isGeneratorFunction: [],
            isAll: [],
            from: []
        };

        for (let i = 0; i < exportBeginnings.length; i++) {
            curCommentIndex = NaN;
            let currExports = analizeExport(exportBeginnings[i], i);
            for (let j in currExports) {
                exports[j] = exports[j].concat(currExports[j]);
            }
        }

        this.exports = exports;
    }

    findImports() {
        const rx = /(?:^|\s|\/|\)|\[|;|{|})(import)(?={|\s|\/)/gm;
        let match;
        const importBeginnings = [];
        while ((match = rx.exec(this.source))) {
            let curPos = match[0].indexOf('import') + match.index;
            if (this.isCommentOrString(curPos)) {
                continue;
            }
            importBeginnings.push(curPos);
        }

        let curCommentIndex = NaN;

        const analizeImport = (i, exportIndex) => {
            i += 6;
            const importBeginning = i;

            const states = {
                start: 0,
                brackets: {
                    anything: 10,
                    var: 11,
                    as: 12,
                    label: 13
                },
                default: {
                    anything: 61,
                    var: 62
                },
                all: {
                    anything: 71,
                    var: 72
                },
                end: 100
            };

            const memory = {
                currVar: new Array(1000),
                currVarLength: 0,
                currLabel: new Array(1000),
                currLabelLength: 0,
                importType: '',
                nonCodeSkipped: false,
                from: null
            };

            const currImportsArr = {
                importIndexes: [],
                importBeginnings: [],
                names: [],
                labels: [],
                isBrackets: [],
                isDefault: [],
                isAll: [],
                from: [],
            };

            const saveVar = () => {
                const name = memory.currVar.join('');
                const label = memory.currLabelLength > 0 ? memory.currLabel.join('') : name;

                memory.currVar.fill(undefined);
                memory.currLabel.fill(undefined);
                memory.currVarLength = 0;
                memory.currLabelLength = 0;

                currImportsArr.importIndexes.push(exportIndex);
                currImportsArr.importBeginnings.push(importBeginning);
                currImportsArr.names.push(name);
                currImportsArr.labels.push(label || name);
                currImportsArr.isBrackets.push(memory.importType === 'brackets');
                currImportsArr.isDefault.push(memory.importType === 'default');
                currImportsArr.isAll.push(memory.importType === '*');
                currImportsArr.from.push(memory.from);
            };

            const collectResults = () => {
                if (memory.from)
                    for (let i = 0; i < currImportsArr.from.length; i++)
                        currImportsArr.from[i] = memory.from

                return currImportsArr;
            };

            let state = states.start;

            while (i < this.source.length) {
                let j;
                [j, curCommentIndex] = this.skipNonCode(i);
                memory.nonCodeSkipped = i !== j;
                i = j;

                const currChar = this.source.charAt(i);

                switch (state) {
                    /**
                     * Checks import type
                     */
                    case states.start:
                        if ('{'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            state = states.brackets.anything;
                            break;
                        }

                        if ('*'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            state = states.all.anything;
                            break;
                        }

                        if (this.source.substr(i, 4) === 'from') {
                            i += 4;
                            const url = this._commentsAndStrings[this.nextString(i)];
                            memory.from = this.source.substring(url[0], url[1]);
                            state = states.end;
                            break;
                        }

                        memory.importType = 'default';
                        state = states.default.anything;
                        break;

                    /**
                     * IMPORT TYPE Brackets
                     */
                    case states.brackets.anything:
                        memory.importType = 'brackets';
                        i--;
                        state = states.brackets.var;
                        break;

                    case states.brackets.var:
                        if (memory.nonCodeSkipped && 'a'.charCodeAt(0) === this.source.charCodeAt(i) && 's'.charCodeAt(0) === this.source.charCodeAt(i + 1)) {
                            i += 2;
                            state = states.brackets.label;
                            break;
                        }

                        if (','.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            i++;
                            state = states.brackets.anything;
                            break;
                        }

                        if ('}'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.start;
                            break;
                        }

                        memory.currVar[memory.currVarLength++] = currChar;
                        break;

                    case states.brackets.label:
                        [i, curCommentIndex] = this.skipNonCode(i);

                        if (','.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            i++;
                            state = states.brackets.anything;
                            break;
                        }

                        if ('}'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.start;
                            break;
                        }

                        memory.currLabel[memory.currLabelLength++] = currChar;
                        break;


                    /**
                     * IMPORT TYPE Default
                     */
                    case states.default.anything:
                        i -= 1;
                        state = states.default.var;
                        break;

                    case states.default.var:
                        if (jsDelimiterChars.indexOf(this.source.charAt(i)) !== -1) {
                            saveVar();
                            state = states.start;
                            break;
                        }

                        if (memory.nonCodeSkipped) {
                            saveVar();
                            i -= 1;
                            state = states.start;
                            break;
                        }

                        memory.currVar[memory.currVarLength++] = currChar;
                        break;

                    /**
                     * IMPORT TYPE * as obj
                     */
                    case states.all.anything:
                        memory.exportType = '*';
                        [i, curCommentIndex] = this.skipNonCode(i);
                        if (this.source.substr(i, 2) === 'as') {
                            i += 2;
                            state = states.all.var;
                            break;
                        }

                        break;

                    case states.all.var:
                        if (','.charCodeAt(i) === currChar.charCodeAt(i)) {
                            saveVar();
                            state = states.start;
                            break;
                        }

                        if (memory.nonCodeSkipped) {
                            saveVar();
                            i -= 1;
                            state = states.start;
                            break;
                        }

                        memory.currVar[memory.currVarLength++] = currChar;
                        break;

                    /**
                     * Return results
                     */
                    case states.end:
                        return collectResults();
                }

                i++;
            }

            return collectResults();
        };

        const imports = {
            importIndexes: [],
            importBeginnings: [],
            names: [],
            labels: [],
            isBrackets: [],
            isDefault: [],
            isAll: [],
            from: [],
        };

        for (let i = 0; i < importBeginnings.length; i++) {
            curCommentIndex = NaN;
            let currExports = analizeImport(importBeginnings[i], i);
            for (let j in currExports) {
                imports[j] = imports[j].concat(currExports[j]);
            }
        }

        this.imports = imports;
    }

    findScope(index) {
        // make this more universal, keep maps for both opening and closing brackets, not just closing
        // to make it easier to port for 'var's
        const opening = binarySearchLowerBound(this._es6Scopes[0], index);
        const closing = this._closingScopesSorted[1][binarySearchUpperBound(this._closingScopesSorted[0], index)];
        if (opening < 0 || closing < 0) {
            return -1;
        }
        if (!this._scopeGraphFunctions) {
            this._scopeGraphFunctions = getLCA(this._es6ScopeGraph);
        }
        return this._scopeGraphFunctions.lca(opening, closing);
    }

    findReferences(variable) {
        const rx = new RegExp('(?:^|\\s|=|\\+|\\-|\\/|\\*|\\%|\\(|\\)|\\[|;|:|{|}|\\n|\\r|,|!|&|\\||\\^|\\?|>|<)('
            + variable
            + ')(?=\\s|$|=|\\+|\\.|\\-|\\/|\\*|\\%|\\(|\\)|\\[|\\]|;|:|{|}|\\n|\\r|,|!|&|\\||\\^|\\?|>|<)', 'gm');
        let match;
        const matches = [];

        // might be a bug if there is a = somethingsomethingfunction* x, we will mistake this for a definition
        // probably need to check the other side too
        const declarationTypes = ['var', 'let', 'const', 'class', 'function', 'function*'];
        const isMultivariable = [true, true, true, false, false, false];

        const isDeclaration = (index, scope = this.findScope(index)) => {
            const scopeStart = scope === -1 ? 0 : this._es6Scopes[0][scope];
            // we need to check for commas not just keywords for multiple definition variables
            [index, _] = this.skipNonCode(index - 1, -1);

            // multivariable case
            if (this.source.charCodeAt(index) === ','.charCodeAt(0)) {
                // todo: fix it when @serg will provide data
                // if(insideFunctionParams) {
                //     return isfunctionDefinition
                // }

                // todo: go back until var/let/const...
                // todo: gor has this code somewhere, find it
                // todo: put it here :D

                let newIndex = index;
                let nonCodeSkipped = false;
                while (index > scopeStart) {
                    index--;
                    [newIndex, _] = this.skipNonCode(index, -1);
                    nonCodeSkipped = index !== newIndex;
                    index = newIndex;
                    [index, _] = this.skipBrackets(index);
                    console.log('asd', index, this.source.charAt(index), nonCodeSkipped);
                }
            }
            let i = 0;
            let curLength = 0;
            const len = declarationTypes.length;
            let cur = '';
            while (i < len) {
                if (curLength !== declarationTypes[i].length) {
                    curLength = declarationTypes[i].length;
                    cur = this.source.substr(index - curLength + 1, curLength);
                }
                if (cur === declarationTypes[i]) {
                    return true;
                }
                i++;
            }
            return false;
        };

        // we really need a stack only to be able to link variables from nested scopes to each other
        // for import export purpuses we dont need this at all, we can just check if we are in a global scope
        // or not, and proceed accordingly.
        // const declarationScopeStack = [];
        // so lets just go with the last variable
        let lastDeclarationScope = null;

        const references = [];
        const scopes = [];
        const isDec = [];
        const declarationScopes = new Set();

        let type = null;
        while ((match = rx.exec(this.source))) {
            const index = match[0].indexOf(variable) + match.index;
            if (!this.isCommentOrString(index)) {
                const scope = this.findScope(index);
                const isDecReference = isDeclaration(index, scope);
                scopes.push(scope);
                isDec.push(isDecReference);

                if (isDecReference) {
                    declarationScopes.add(scope);
                    if (scope === -1) {
                        // todo: get type of global declaration
                        type = 1;
                    }
                }

                references.push(index);
            }
        }

        // console.log(declarationScopes);
        console.table({references, scopes, isDec});

        for (let i = 0; i < references.length; i++) {
            // todo: get all updated references

            // if (lastDeclarationScope !== null &&
            //     lastDeclarationScope !== scope &&
            //     this._scopeGraphFunctions.isParent(lastDeclarationScope, scope)) {
            //     continue;
            // }
            // else {
            //     lastDeclarationScope = null;
            // }
            //
            // if (isDeclaration(index)) {
            //     console.log(`Found declaration of ${variable} at ${index} scope ${scope}`);
            //     // declarationScopeStack.push(scope);
            //     lastDeclarationScope = scope;
            // }
            // matches.push(match.index);
        }

        console.log(matches);
    }


    // helper functions

    visualizeCode(container) {
        const spacePlaceHolder = String.fromCharCode(1000);
        const newLinePlaceHolder = String.fromCharCode(1001);

        const cur = this.source.replace(/\n/g, newLinePlaceHolder).replace(/\s/g, spacePlaceHolder);
        let res = '';
        const scopes = [...this._es6Scopes[0], ...this._es6Scopes[1]];

        for (let i = 0; i < cur.length; i++) {
            let c = cur.charAt(i).replace('<', "&lt;").replace('>', "&gt;");

            if (this.isCommentOrString(i)) {
                c = `<u><b>${c}</b></u>`;
            }

            if (scopes.indexOf(i) !== -1) {
                if (c === spacePlaceHolder || c === newLinePlaceHolder) {
                    c += `<span style="background-color: #ff0000; color: #fff">&nbsp</span>`;
                } else {
                    c = `<span style="background-color: #ff0000; color: #fff">${c}</span>`;
                }

            }

            res += c;

        }

        container.innerHTML = res.replace(new RegExp(newLinePlaceHolder, 'g'), '<br>').replace(new RegExp(spacePlaceHolder, 'g'), '&nbsp;');
    }

    visualizeExports() {
        const reshape = () => {

            const len = this.exports.names.length;

            const ret = [];

            for (let i = 0; i < len; i++) {
                let col = {};

                for (let key in this.exports) {
                    col[key] = this.exports[key][i]
                }

                ret.push(col)
            }

            return ret;
        };

        console.table(reshape())
    }

    visualizeImports() {
        const reshape = () => {

            const len = this.imports.names.length;

            const ret = [];

            for (let i = 0; i < len; i++) {
                let col = {};

                for (let key in this.imports) {
                    col[key] = this.imports[key][i]
                }

                ret.push(col)
            }

            return ret;
        };

        console.table(reshape())
    }

}

StaticAnalyzer.scopeTypes = {
    es5: 0b0000000000,
    es6: 0b1000000000,
    singleStatement: 0b0100000000,
    expression: 0b0010000000,
    class: 0b0000000001,
    function: 0b0000000010,
    arrowFunction: 0b0000000100,
    for: 0b0000001000,
    if: 0b0000010000,
    while: 0b0000100000,
    do: 0b0001000000
};