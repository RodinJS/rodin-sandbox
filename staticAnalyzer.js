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

        this.scopes = needles.map(a => a[0]);
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
        const resTypes = [];
        const instances = [];
        const scopes = [[], []];
        const scopeGraph = [];

        const scopeStack = [];
        let scopeStackSize = 0;

        this._scopeString = '';

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
            let resI = res.length - 1;
            while (j >= 0 && (this.source.charCodeAt(j) <= 32 || /* || this.source.charCodeAt(j) === 10 || /!*this.source.charCodeAt(j) === 9 ||*!/*/
            (resI >= 0 && res[resI][0] < j && res[resI][1] > j))) {
                j--;
                if (resI >= 0 && res[resI][0] < j && res[resI][1] > j) {
                    j = res[resI][0] - 1;
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

        const saveScope = (bracket) => {

            // todo: make a debug flag for these things
            this._scopeString += String.fromCharCode(bracket);
            if (bracket === '{'.charCodeAt(0)) {
                // add new scope we just found to the graph
                scopeGraph.push([]);
                // check if there is a scope which contains it
                if (scopeGraph[scopeStack[scopeStackSize - 1]]) {
                    // push the current scope to its parent
                    // note: scopes[0].length without -1 because \
                    // we haven't yet added the current one
                    scopeGraph[scopeStack[scopeStackSize - 1]].push(scopes[0].length);
                }
                // add both beginning and ending of the scope we found
                // the ending is NaN because we will fill it in later
                scopes[0].push(i);
                scopes[1].push(NaN);
                // check if our array has enough space to add an element
                if (scopeStack.length < scopeStackSize) {
                    // if it does not use .push
                    scopeStack.push(scopes[0].length - 1);
                }
                else {
                    // otherwise just set the element we need
                    scopeStack[scopeStackSize] = scopes[0].length - 1;
                }
                scopeStackSize++;
            } else {
                // change the value we put as NaN earlier
                scopes[1][scopeStack[scopeStackSize - 1]] = i;
                scopeStackSize--;
            }
            //scopes.push([i, bracket]);
        };

        const saveResult = (end = i) => {
            instances.push(this.source.substring(start, end + 1));
            res.push([start, end + 1]);
            resTypes.push(state);
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
                        literalStringStackSize++;
                        state = s.literalString;
                    } else if (inLiteralString && cur === '}'.charCodeAt(0)) {
                        state = s.literalString;
                        inLiteralString = false;
                    } else if (cur === '{'.charCodeAt(0)) {
                        saveScope(cur);
                    } else if (cur === '}'.charCodeAt(0)) {
                        saveScope(cur);
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

        //console.log(res);
        //console.log(instances);
        //window.instances = instances;
        this._commentsAndStrings = res;
        this._commentsAndStringsTypes = resTypes;
        this._commentsAndStringsAnalyzed = true;
        this._scopes = scopes;
        this._scopeGraph = scopeGraph;
        //return res;
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
        const skipNonCode = (j) => {
            curCommentIndex = curCommentIndex || binarySearch(this._commentsAndStrings, j, true);

            while (j < this.source.length) {
                if (curCommentIndex >= 0 && curCommentIndex < this._commentsAndStrings.length &&
                    this._commentsAndStrings[curCommentIndex][0] <= j && j <= this._commentsAndStrings[curCommentIndex][1]) {

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

            return j;
        };

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

        const skipBrackets = (j) => {
            let oldJ = j;
            const openingBracket = this.source.charCodeAt(j);

            if (['{'.charCodeAt(0), '('.charCodeAt(0), '['.charCodeAt(0)].indexOf(openingBracket) === -1)
                return oldJ;

            if (openingBracket === '{'.charCodeAt(0)) {
                curCommentIndex = NaN;
                return this._scopes[1][this._scopes[0].indexOf(j)];
            }

            let closingBracket;
            if (openingBracket === '('.charCodeAt(0))
                closingBracket = ')'.charCodeAt(0);

            if (openingBracket === '['.charCodeAt(0))
                closingBracket = ']'.charCodeAt(0);

            let stack = 1;
            while (++j < this.source.length) {
                j = skipNonCode(j);

                if (openingBracket === this.source.charCodeAt(j))
                    stack++;

                if (closingBracket === this.source.charCodeAt(j)) {
                    stack--;

                    if (stack === 0)
                        return j;
                }
            }

            return oldJ;
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
                let j = skipNonCode(i);
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
                            let j = skipNonCode(i + 1);
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
                        i = skipNonCode(i);

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
                        i = skipNonCode(i);

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
                        i = skipBrackets(i);

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

        const exportsArr = {
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
            let currExportsArr = analizeExport(exportBeginnings[i], i);
            for (let j in currExportsArr) {
                exportsArr[j] = exportsArr[j].concat(currExportsArr[j]);
            }
        }

        this.exportsArr = exportsArr;
    }


    findReferences(variable) {
        const rx = new RegExp('(?:^|\\s|=|\\+|\\-|\\/|\\*|\\%|\\(|\\)|\\[|;|:|{|}|\\n|\\r|,|!|&|\\||\\^|\\?|>|<)('
            + variable
            + ')(?=\\s|$|=|\\+|\\.|\\-|\\/|\\*|\\%|\\(|\\)|\\[|\\]|;|:|{|}|\\n|\\r|,|!|&|\\||\\^|\\?|>|<)', 'gm'
        );
        let match;
        const matches = [];
        const start = Date.now();
        while ((match = rx.exec(this.source))) {
            matches.push(match.index);
        }
        console.log("findReferences", Date.now() - start);
        console.log(matches);
    }


    // helper functions

    visualizeCode(container) {
        const cur = this.source;
        let res = '';
        const scopes = [...this._scopes[0], ...this._scopes[1]];


        for (let i = 0; i < cur.length; i++) {
            let c = cur.charAt(i).replace('<', "&lt;").replace('>', "&gt;");

            if (this.isCommentOrString(i)) {
                c = `<u><b>${c}</b></u>`;
            }

            if (scopes.indexOf(i) !== -1) {
                c = `<mark>${c}</mark>`;
            }

            res += c;

        }

        container.innerHTML = res.replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');
    }

    visualizeExports() {
        const reshape = () => {

            const len = this.exportsArr.names.length;

            const ret = [];

            for (let i = 0; i < len; i++) {
                let col = {};

                for (let key in this.exportsArr) {
                    col[key] = this.exportsArr[key][i]
                }

                ret.push(col)
            }

            return ret;
        };

        console.table(reshape())
    }

}
