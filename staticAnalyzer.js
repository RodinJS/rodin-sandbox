/**
 * Class StaticAnalyzer
 */
class StaticAnalyzer {
    constructor(source) {
        this.source = source;
        this._commentsAndStringsAnalyzed = false;
        this._es6Scopes = null;
        this._es5Scopes = null;
        this._scopeData = [];

        this._es6ScopeGraphData = null;
        this._es5ScopeGraphData = null;

        this._es5ScopeMap = [];

        this._closingEs5ScopesSorted = [[], []];
        this._closingEs6ScopesSorted = [[], []];

        this._functionAndClassDeclarations = [[], [], []];

        this._destructions = [];
    }

    checkIfExpressionIsOver(index) {
        // todo: tidy this up, a lot of code repetition
        let a = index;
        let strArr = [];
        const skipParams = {cci: null};
        a = this.skipNonCode(a, skipParams, -1);
        if (this.source.charCodeAt(a) === 46 /* '.'.charCodeAt(0) */ ||
            this.source.charCodeAt(a) === 40 /* '('.charCodeAt(0) */ ||
            this.source.charCodeAt(a) === 91 /* '['.charCodeAt(0) */) {
            return false;
        }
        while (true) {
            if (StaticAnalyzer.operatorChars.indexOf(this.source.charCodeAt(a)) === -1) {
                let [s, e] = this.getWordFromIndex(a);
                const subStr = this.source.substring(s, e);
                if (StaticAnalyzer.operatorWords.indexOf(subStr) !== -1) {
                    strArr.push(...subStr.split('').reverse());
                    a = s - 1;
                } else {
                    break;
                }
            }
            strArr.push(this.source.charAt(a));
            a = this.skipNonCode(a - 1, skipParams, -1);
        }
        let operatorStr = strArr.reverse().join('');
        strArr = [];

        if (doEvalCheck(operatorStr)) {
            skipParams.cci = null;
            a = this.skipNonCode(index, skipParams);
            if (this.source.charCodeAt(a) === 46 /* '.'.charCodeAt(0) */ ||
                this.source.charCodeAt(a) === 40 /* '('.charCodeAt(0) */ ||
                this.source.charCodeAt(a) === 91 /* '['.charCodeAt(0) */) {
                return false;
            }
            while (true) {
                if (StaticAnalyzer.operatorChars.indexOf(this.source.charCodeAt(a)) === -1) {
                    let [s, e] = this.getWordFromIndex(a);
                    const subStr = this.source.substring(s, e);
                    if (StaticAnalyzer.operatorWords.indexOf(subStr) !== -1) {
                        strArr.push(subStr);
                        a = e;
                    } else {
                        break;
                    }
                }
                strArr.push(this.source.charAt(a));
                a = this.skipNonCode(a + 1, skipParams);
            }

            operatorStr += strArr.join('');
            if (!doEvalCheck(operatorStr, 0)) {
                return true;
            }
        }
        return false;
    };

    analyzeCommentsAndStrings() {
        const commentsAndStrings = [];
        const commentAndStringTypes = [];
        const instances = [];
        const es6Scopes = [[], []];

        const scopeGraph = [];

        this._commentsAndStrings = commentsAndStrings;
        this._commentsAndStringsTypes = commentAndStringTypes;
        this._commentsAndStringsAnalyzed = true;
        this._es6Scopes = es6Scopes;
        this._es6ScopeGraphData = scopeGraph;


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
        const wordsBeforeRegex = ['return', 'yield', 'typeof', 'case', 'do', 'else'];

        const length = this.source.length;
        let i = 0;
        let state = s.anything;
        let stringType = '"'.charCodeAt(0);
        let inLiteralString = false;

        let start = null;

        let literalStringStackSize = 0;

        const skipNonCode = (j) => {
            let resI = commentsAndStrings.length - 1;
            while (j >= 0 && (this.source.charCodeAt(j) <= 32 || (resI >= 0 && commentsAndStrings[resI][0] < j && commentsAndStrings[resI][1] > j))) {
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

                while (j >= 0 && StaticAnalyzer.jsDelimiterChars.indexOf(this.source.charCodeAt(j)) === -1) {
                    j--;
                }
                const wordStart = j + 1;

                if (roundBrackets && jsOneLiners.indexOf(this.source.substring(wordStart, wordEnd)) !== -1) {
                    return true;
                } else if (!roundBrackets && wordsBeforeRegex.indexOf(this.source.substring(wordStart, wordEnd)) !== -1) {
                    return true;
                }

                return false;
            }
            return true;
        };

        const saveResult = (end = i) => {
            instances.push(this.source.substring(start, end + 1));
            commentsAndStrings.push([start, end + 1]);
            commentAndStringTypes.push(state);
        };

        while (i < length) {
            const cur = this.source.charCodeAt(i);

            switch (state) {
                case s.anything:

                    start = i;
                    if (cur === 47 /* '/'.charCodeAt(0) */) {
                        state = s.afterSlash;
                    } else if (cur === 34 /* '"'.charCodeAt(0) */ || cur === 39 /* '\''.charCodeAt(0) */) {
                        state = s.string;
                        stringType = cur;
                    } else if (cur === 96 /* '`'.charCodeAt(0) */) {
                        literalStringStackSize++;
                        state = s.literalString;
                    } else if (inLiteralString && cur === 125 /* '}'.charCodeAt(0) */) {
                        state = s.literalString;
                        inLiteralString = false;
                    }

                    break;
                case s.afterSlash:
                    if (cur === 47 /* '/'.charCodeAt(0) */) {
                        state = s.comment;
                    } else if (cur === 42 /* '*'.charCodeAt(0) */) {
                        state = s.multilineComment;
                    } else if (regexPrefixCheck()) {
                        state = s.regex;
                        i -= 1;
                    } else {
                        state = s.anything;
                        i -= 1;
                    }
                    break;
                case s.comment:
                    if (cur === 10 /* '\n'.charCodeAt(0) */ || i === length - 1) {
                        saveResult();
                        state = s.anything;
                    }
                    break;
                case s.multilineComment:
                    if (cur === 42 /* '*'.charCodeAt(0) */ && this.source.charCodeAt(i + 1) === 47 /* '/'.charCodeAt(0) */) {
                        i++;
                        saveResult(i);
                        state = s.anything;
                    }
                    break;
                case s.regex:

                    if (cur === 92 /* '\\'.charCodeAt(0) */) {
                        i++;
                    } else if (cur === 10 /* '\n'.charCodeAt(0) */) {
                        state = s.anything;
                        i = start;
                    } else if (cur === 91 /* '['.charCodeAt(0) */) {
                        state = s.squareBracketsRegex;
                    } else if (cur === 47 /* '/'.charCodeAt(0) */) {
                        saveResult();
                        state = s.anything;
                    }
                    break;
                case s.squareBracketsRegex:
                    if (cur === 92 /* '\\'.charCodeAt(0) */) {
                        i++;
                    } else if (cur === 93 /* ']'.charCodeAt(0) */) {
                        state = s.regex;
                    }
                    break;
                case s.string:
                    if (cur === 92 /* '\\'.charCodeAt(0) */) {
                        i++;
                    } else if (cur === stringType) {
                        saveResult();
                        state = s.anything;
                    }
                    break;
                case s.literalString:
                    if (cur === 92 /* '\\'.charCodeAt(0) */) {
                        i++;
                    } else if (cur === 36 /* '$'.charCodeAt(0) */ && this.source.charCodeAt(i + 1) === 123 /* '{'.charCodeAt(0) */) {
                        i++;
                        saveResult();
                        state = s.anything;
                        inLiteralString = true;
                    } else if (cur === 96 /* '`'.charCodeAt(0) */) {
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
    }

    analyzeScopes() {
        const n = this.source.length;
        let i = 0;

        const es6Scopes = this._es6Scopes;
        const es6ScopeGraph = this._es6ScopeGraphData;
        this._es5Scopes = [[], [], []];
        const es5Scopes = this._es5Scopes;
        this._es5ScopeGraphData = [];
        const es5ScopeGraph = this._es5ScopeGraphData;

        // 0 stands for the global scope
        const scopeStack = [];
        let scopeStackSize = 0;
        this._scopeData.push();


        const bracketStack = [];
        const popBracketStack = (bracket) => {
            const last = bracketStack[bracketStack.length - 1];
            if (bracket !== last) {
                if (last === -1) {
                    saveScope(-2, StaticAnalyzer.scopeTypes.expression);
                } else if (last === -3) {
                    saveScope(-4, StaticAnalyzer.scopeTypes.singleStatement);
                }
            }
            return bracketStack.pop();
        };

        const bracketMap = {
            ['('.charCodeAt(0)]: ')'.charCodeAt(0),
            ['['.charCodeAt(0)]: ']'.charCodeAt(0),
            ['{'.charCodeAt(0)]: '}'.charCodeAt(0),
            [')'.charCodeAt(0)]: '('.charCodeAt(0),
            [']'.charCodeAt(0)]: '['.charCodeAt(0),
            ['}'.charCodeAt(0)]: '{'.charCodeAt(0),
            [-1]: -2,
            [-2]: -1,
            [-3]: -4,
            [-4]: -3
        };

        let curCommentIndex = {cci: null};
        const es5Functions = ['function', 'function*'];

        /**
         * checks if the there is a function or class at the given position
         * if type is 0 checks only for function,
         * if type is 1 checks only for class
         * @param j
         * @param type
         * @return {*}
         */
        const checkIfClassOrFunction = (j, type = 0) => {
            let scopeData = [StaticAnalyzer.scopeTypes.es6];
            let closingRoundBracket = null, openingRoundBracket = null;

            // only need to do this for functions, classes dont have ()
            if (type === 0) {
                closingRoundBracket = j + 1;
                j = this.skipBrackets(j, StaticAnalyzer.cOBJ);
                openingRoundBracket = ++j;

                if (this._scopeData[scopeStack[scopeStackSize - 1]] &&
                    this._scopeData[scopeStack[scopeStackSize - 1]][0] === StaticAnalyzer.scopeTypes.class) {
                    let scopeType = StaticAnalyzer.scopeTypes.function;
                    return [scopeType, [openingRoundBracket, closingRoundBracket]];
                }
            }


            let tmpI = 0;
            let fcnOrClassName;

            while (tmpI < 2) {
                j = this.skipNonCode(--j, StaticAnalyzer.cOBJ, -1);
                const nextWord = this.getWordFromIndex(j);
                const cur = this.source.substring(nextWord[0], nextWord[1]);
                if (tmpI === 0)
                    fcnOrClassName = cur;
                j = nextWord[0];
                if (type === 0 && es5Functions.indexOf(cur) !== -1) {
                    let scopeType = StaticAnalyzer.scopeTypes.function;
                    scopeData = [scopeType, [openingRoundBracket, closingRoundBracket]];
                    break;
                } else if (type === 1 && cur === 'class') {
                    let scopeType = StaticAnalyzer.scopeTypes.class;
                    scopeData = [scopeType];
                    break;
                }
                tmpI++;
            }

            if (tmpI > 0 &&
                (scopeData[0] === StaticAnalyzer.scopeTypes.class ||
                    scopeData[0] === StaticAnalyzer.scopeTypes.function)) {
                this._functionAndClassDeclarations[0].push(fcnOrClassName);
                this._functionAndClassDeclarations[1].push(j);
                this._functionAndClassDeclarations[2].push(type);
            }

            return scopeData;
        };

        //todo: one line arrow functions, for, if, while, do
        const saveScope = (bracket, scopeType = StaticAnalyzer.scopeTypes.es6) => {
            let scopeData = [StaticAnalyzer.scopeTypes.es6];

            let isOpening = false;
            let scopeStart = i;
            let scopeEnd = i;
            let j = i;
            const skipParams = {cci: null};
            let c = null;
            // todo: make a debug flag for these things

            switch (scopeType) {
                case StaticAnalyzer.scopeTypes.es5:  // the global scope
                    // make this a constant
                    if (bracket === 11116666) {
                        isOpening = true;
                        scopeData = [scopeType];
                    } else {
                        isOpening = false;
                    }

                    break;
                case StaticAnalyzer.scopeTypes.arrowFunction:
                    i = this.skipNonCode(i + 2, StaticAnalyzer.cOBJ);
                    curCommentIndex.cci = null;
                    c = j - 1;
                    c = this.skipNonCode(c, skipParams, -1); // add curCommentIndex
                    let closingRoundBracket = c;
                    let openingRoundBracket = null;

                    // a=>{}
                    if (this.source.charCodeAt(c) !== 41 /* ')'.charCodeAt(0) */) {
                        closingRoundBracket++;
                        c = this.getWordFromIndex(c)[0];
                        // todo: figure out if this if j or j+1
                        openingRoundBracket = c;
                    } else {
                        // (a,b,c)=>
                        c = this.skipBrackets(c, skipParams);
                        openingRoundBracket = c + 1;
                    }
                    scopeStart = openingRoundBracket;
                    if (this.source.charCodeAt(i) !== 123 /* '{'.charCodeAt(0) */) {
                        // revert back one character so things like ({}) will work
                        i -= 2;
                        curCommentIndex.cci = null;
                        scopeType = scopeType | StaticAnalyzer.scopeTypes.expression;
                        bracket = -1; // no bracket at all
                    }

                    scopeData = [scopeType, [openingRoundBracket, closingRoundBracket]];

                    isOpening = true;
                    break;
                case StaticAnalyzer.scopeTypes.singleStatement:
                case StaticAnalyzer.scopeTypes.expression:
                    isOpening = false;
                    scopeEnd = i - 1;

                    // bracketStack.pop();
                    break;
                case StaticAnalyzer.scopeTypes.for:
                    isOpening = true;
                    scopeStart = i;
                    i = this.skipNonCode(i + 3, skipParams);
                    i = this.skipBrackets(i, skipParams);
                    i = this.skipNonCode(++i, skipParams);

                    // i++;

                    if (this.source.charCodeAt(i) !== 123 /* '{'.charCodeAt(0) */) {
                        // revert back one character so things like ({}) will work
                        // not sure if -=2 or -=1
                        i -= 2;
                        scopeType = scopeType | StaticAnalyzer.scopeTypes.singleStatement;
                        bracket = -3; // no bracket at all, but a statement instead of an expression
                    }
                    curCommentIndex.cci = null;
                    scopeData = [scopeType];
                    break;
            }


            if (bracket === 123 /* '{'.charCodeAt(0) */) {
                isOpening = true;
                j = this.skipNonCode(--j, StaticAnalyzer.cOBJ, -1);

                // checking if the scope is a function
                if (this.source.charCodeAt(j) === 41 /* ')'.charCodeAt(0) */) {
                    scopeData = checkIfClassOrFunction(j, 0); // check for a function
                    if (scopeData[1]) {
                        scopeStart = scopeData[1][0];
                    }
                } else {
                    scopeData = checkIfClassOrFunction(j, 1); // check for a class
                }
            }

            if (bracket === 125 /* '}'.charCodeAt(0) */) {
                isOpening = false;
                if (this._scopeData[scopeStart[scopeStack.length - 1]] &&
                    this._scopeData[scopeStart[scopeStack.length - 1]][0] === StaticAnalyzer.scopeTypes.destruction) {
                    scopeType = StaticAnalyzer.scopeTypes.destruction;
                    this._scopeData[scopeStack[scopeStackSize - 1]] = [scopeType];
                } else {
                    j = this.skipNonCode(++j, StaticAnalyzer.cOBJ);

                    if (this.source.charCodeAt(j) === 61 /* '='.charCodeAt(0) */) {
                        scopeType = StaticAnalyzer.scopeTypes.destruction;
                        this._scopeData[scopeStack[scopeStackSize - 1]] = [scopeType];
                        this._destructions.push(i);
                    }
                }
            }

            if (isOpening) {
                bracketStack.push(bracket);

                // add new scope we just found to the graph
                es6ScopeGraph.push([]);
                // check if there is a scope which contains it
                if (scopeStackSize) {
                    // push the current scope to its parent
                    // note: es6Scopes[0].length without -1 because \
                    // we haven't yet added the current one
                    es6ScopeGraph[scopeStack[scopeStackSize - 1]].push(es6Scopes[0].length);
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
                this._scopeData.push(scopeData);
            } else {
                // change the value we put as NaN earlier
                es6Scopes[1][scopeStack[scopeStackSize - 1]] = scopeEnd;
                this._closingEs6ScopesSorted[0].push(scopeEnd);
                this._closingEs6ScopesSorted[1].push(scopeStack[scopeStackSize - 1]);

                // todo: this definitely needs major refactoring
                scopeStackSize--;
                while (true) {
                    const last = popBracketStack(bracketMap[bracket]);
                    if (!last || !bracketStack.length || last > 0 || bracketStack[bracketStack.length - 1] > 0)
                        break;
                    saveScope(bracketStack[bracketStack.length - 1] - 1, StaticAnalyzer.scopeTypes.expression);
                }
            }
        };

        // open the global scope
        saveScope(StaticAnalyzer.globalScopeBracket, StaticAnalyzer.scopeTypes.es5);


        while (i < n) {
            const cur = this.source.charCodeAt(i);

            if (cur === 123 /* '{'.charCodeAt(0) */) {
                saveScope(cur);
            } else if (cur === 125 /* '}'.charCodeAt(0) */) {
                saveScope(cur);
            } else if (cur === 61 /* '='.charCodeAt(0) */ && this.source.charCodeAt(i + 1) === 62 /* '>'.charCodeAt(0) */) {
                saveScope(cur, StaticAnalyzer.scopeTypes.arrowFunction);
            } else if (StaticAnalyzer.jsDelimiterChars.indexOf(this.source.charCodeAt(i - 1)) !== -1 &&
                StaticAnalyzer.jsDelimiterChars.indexOf(this.source.charCodeAt(i + 3)) !== -1 &&
                this.source.substr(i, 3) === 'for') {
                saveScope(cur, StaticAnalyzer.scopeTypes.for);
            } else {
                // arrow functions, e.g. a = (a,b,c,d)=>a+b+c+typeof d
                if (bracketStack[bracketStack.length - 1] === -1) {
                    if (cur === 59 /* ';'.charCodeAt(0) */ || cur === 44 /* ','.charCodeAt(0) */) {
                        saveScope(-2, StaticAnalyzer.scopeTypes.expression);
                    } else if (cur === '\n'.charCodeAt(0)) {
                        if (this.checkIfExpressionIsOver(i)) {
                            saveScope(-2, StaticAnalyzer.scopeTypes.expression);
                        }
                    }
                }

                // for loops e.g. for (let i=0;i<10;i++) console.log(i), i++, true, i--
                if (bracketStack[bracketStack.length - 1] === -3) {
                    if (cur === 59 /* ';'.charCodeAt(0) */) {
                        saveScope(-4, StaticAnalyzer.scopeTypes.singleStatement);
                    } else if (cur === 10 /* '\n'.charCodeAt(0) */) {
                        if (this.checkIfExpressionIsOver(i)) {
                            saveScope(-4, StaticAnalyzer.scopeTypes.singleStatement);
                        }
                    }
                }

                if (cur === 40 /* '('.charCodeAt(0) */ || cur === 91 /* '['.charCodeAt(0) */) {
                    bracketStack.push(cur);
                } else if (cur === 41 /* ')'.charCodeAt(0) */) {
                    popBracketStack(41 /* ')'.charCodeAt(0) */);
                } else if (cur === 93 /* ']'.charCodeAt(0) */) {
                    popBracketStack(93 /* ']'.charCodeAt(0) */);

                    const j = this.skipNonCode(i + 1, StaticAnalyzer.cOBJ);
                    if (this.source.charCodeAt(j) === 61 /* '='.charCodeAt(0) */) {
                        this._destructions.push(i);
                    }
                }
            }

            i = this.skipNonCode(++i, curCommentIndex, 1, true, true, false);
        }

        // close the global scope
        saveScope(1, StaticAnalyzer.scopeTypes.es5);

        {
            const n = es6Scopes[0].length;
            const scopeStack = [];
            const allScopes = [];

            // start numerating k(scope indexes) from 1, because 0 is the global scope
            for (let i = 0, k = 0; i < n; i++) {
                if (this._scopeData[i][0] >> 10) {
                    continue;
                }

                es5Scopes[0].push(es6Scopes[0][i]);
                es5Scopes[1].push(es6Scopes[1][i]);

                es5Scopes[2].push(k);
                allScopes.push([es6Scopes[0][i], k, 0]);
                allScopes.push([es6Scopes[1][i], k, 1]);
                k++;
                this._es5ScopeMap.push(i);
            }
            allScopes.sort((a, b) => a[0] - b[0]);
            const m = allScopes.length;

            for (let i = 0; i < m; i++) {
                if (!allScopes[i][2]) {
                    es5ScopeGraph.push([]);
                    if (scopeStack.length) {
                        es5ScopeGraph[scopeStack[scopeStack.length - 1]].push(allScopes[i][1]);
                    }
                    scopeStack.push(allScopes[i][1]);

                } else {
                    this._closingEs5ScopesSorted[0].push(es5Scopes[allScopes[i][1]]);
                    this._closingEs5ScopesSorted[1].push(allScopes[i][1]);
                    scopeStack.pop();
                }
            }
        }

        this._es5ScopeGraph = new Graph(this._es5ScopeGraphData);
        this._es6ScopeGraph = new Graph(this._es6ScopeGraphData);
        this._es5ScopeGraph.analyze();
        this._es6ScopeGraph.analyze();
    }

    isCommentOrString(index) {
        if (!this._commentsAndStringsAnalyzed) {
            // not analyzed
            return false;
        }

        return binarySearchIntervals(this._commentsAndStrings, index) !== -1;
    }

    skipNonCode(j, params, direction = 1, skipComments = true, skipWhitespace = true, skipNewLine = true, skipStrings = true) {
        const oldJ = j;
        let curCommentIndex = params.cci;
        if (curCommentIndex !== 0 && !curCommentIndex) {
            curCommentIndex = binarySearchIntervals(this._commentsAndStrings, j, true);
        }

        while (j < this.source.length && j >= 0) {
            if (((skipComments &&
                    (this._commentsAndStringsTypes[curCommentIndex] === 4 || this._commentsAndStringsTypes[curCommentIndex] === 5)) ||
                    (skipStrings &&
                        (this._commentsAndStringsTypes[curCommentIndex] === 1 || this._commentsAndStringsTypes[curCommentIndex] === 2 || this._commentsAndStringsTypes[curCommentIndex] === 6))) &&
                curCommentIndex >= 0 && curCommentIndex < this._commentsAndStrings.length &&
                this._commentsAndStrings[curCommentIndex][0] <= j && j <= this._commentsAndStrings[curCommentIndex][1]) {

                j = this._commentsAndStrings[curCommentIndex][direction === 1 ? 1 : 0];
                if (direction === -1) {
                    j--;
                }

                curCommentIndex += direction;
                continue;
            }

            const curCharCode = this.source.charCodeAt(j);
            if ((skipNewLine && curCharCode === 10) || (skipWhitespace && curCharCode <= 32 && curCharCode !== 10)) {
                j += direction;
                continue;
            }

            break;
        }
        if (params.hasOwnProperty('cci')) {
            params.cci = curCommentIndex;
        }
        if (params.hasOwnProperty('skipped')) {
            params.skipped = oldJ === j;
        }

        return j;
    };

    skipBrackets(j, params, forward = true, backward = true) {
        let oldJ = j;
        const bracket = this.source.charCodeAt(j);

        let curCommentIndex = params.cci;
        if (curCommentIndex !== 0 && !curCommentIndex) {
            curCommentIndex = binarySearchIntervals(this._commentsAndStrings, j, true);
        }

        const isOpening = [123 /* '{'.charCodeAt(0) */, 40 /* '('.charCodeAt(0) */, 91 /* '['.charCodeAt(0) */].indexOf(bracket) !== -1;
        const isClosing = [125 /* '}'.charCodeAt(0) */, 41 /* ')'.charCodeAt(0) */, 93 /* ']'.charCodeAt(0) */].indexOf(bracket) !== -1;

        if (!isOpening && !isClosing)
            return oldJ;

        if (isOpening && !forward || isClosing && !backward)
            return oldJ;

        if (bracket === '{'.charCodeAt(0)) {
            if (params.hasOwnProperty('cci')) {
                params.cci = NaN;
            }
            return this._es6Scopes[1][this._es6Scopes[0].indexOf(j)];
        } else if (bracket === '}'.charCodeAt(0)) {
            if (params.hasOwnProperty('cci')) {
                params.cci = NaN;
            }
            return this._es6Scopes[0][this._es6Scopes[1].indexOf(j)] - 1;
        }

        let reverseBracket;
        if (bracket === 40 /* '('.charCodeAt(0) */)
            reverseBracket = 41 /* ')'.charCodeAt(0) */;

        if (bracket === 41 /* ')'.charCodeAt(0) */)
            reverseBracket = 40 /* '('.charCodeAt(0) */;

        if (bracket === 91 /* '['.charCodeAt(0) */)
            reverseBracket = 93 /* ']'.charCodeAt(0) */;

        if (bracket === 93 /* ']'.charCodeAt(0) */)
            reverseBracket = 91 /* '['.charCodeAt(0) */;

        let stack = 1;
        const direction = isOpening ? 1 : -1;
        j += direction;
        while (j < this.source.length && j >= 0) {
            j = this.skipNonCode(j, params, direction);

            if (bracket === this.source.charCodeAt(j)) {
                stack++;
            } else if (reverseBracket === this.source.charCodeAt(j)) {
                stack--;

                if (stack === 0)
                    return isOpening ? j : j - 1;
            }

            j += direction;
        }

        if (params.hasOwnProperty('cci')) {
            params.cci = curCommentIndex;
        }

        if (params.hasOwnProperty('skipped')) {
            params.skipped = oldJ === j;
        }

        return oldJ;
    };

    skipNonCodeAndScopes(j, params, direction = 1, skipComments = true, skipWhitespace = true, skipNewLine = true) {
        const skipBracketsForward = direction === 1;

        let currJ;
        do {
            currJ = j;
            j = this.skipNonCode(j, params, direction, skipComments, skipWhitespace, skipNewLine);
            j = this.skipBrackets(j, params, skipBracketsForward, !skipBracketsForward);
        } while (currJ !== j && j >= 0 && j < this.source.length);

        return j;
    }

    getWordFromIndex(i) {
        if (StaticAnalyzer.jsDelimiterChars.indexOf(this.source.charCodeAt(i)) !== -1)
            return [NaN, NaN];

        if (this.isCommentOrString(i))
            return [NaN, NaN];

        let start = i;
        let end = i;

        let currChar = this.source.charCodeAt(end);
        while (StaticAnalyzer.jsDelimiterChars.indexOf(currChar) === -1 && end < this.source.length) {
            end++;
            currChar = this.source.charCodeAt(end);
        }

        currChar = this.source.charCodeAt(start);
        while (StaticAnalyzer.jsDelimiterChars.indexOf(currChar) === -1 && start >= 0) {
            start--;
            currChar = this.source.charCodeAt(start);
        }

        return [start + 1, end];
    }

    nextString(j, params = {}) {
        let curCommentIndex = params.cci;
        if (curCommentIndex !== 0 && !curCommentIndex) {
            curCommentIndex = binarySearchIntervals(this._commentsAndStrings, j, true);
        }

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

        if (params.hasOwnProperty('cci')) {
            params.cci = curCommentIndex;
        }

        return curCommentIndex;
    };

    isSubstringInArray(index, array, direction = 1) {
        let i = 0;
        let curLength = 0;
        const len = array.length;
        let cur = '';

        while (i < len) {
            if (curLength !== array[i].length) {
                curLength = array[i].length;
                if (direction === 1) {
                    cur = this.source.substr(index, curLength);
                } else {
                    cur = this.source.substr(index - curLength + 1, curLength);
                }
            }

            if (cur === array[i]) {
                return cur;
            }

            i++;
        }

        return null;
    }

    findExports() {
        const cciObject = {cci: NaN};
        const exports = [];

        const analyzeExport = (i, exportIndex) => {
            cciObject.cci = NaN;
            const exportBeginning = i;
            i += 6;

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

            const saveVar = () => {
                const name = memory.currVar.join('');
                const label = memory.currLabelLength > 0 ? memory.currLabel.join('') : name;

                memory.currVar.fill(undefined);
                memory.currLabel.fill(undefined);
                memory.currVarLength = 0;
                memory.currLabelLength = 0;

                exports.push({
                    exportIndex,
                    exportBeginning,
                    name,
                    label,
                    isBrackets: memory.exportType === 'brackets',
                    isLet: memory.exportType === 'let',
                    isConst: memory.exportType === 'const',
                    isVar: memory.exportType === 'var',
                    isClass: memory.exportType === 'class',
                    isFunction: memory.exportType === 'function',
                    isGeneratorFunction: memory.exportType === 'function*',
                    isAll: memory.exportType === '*',
                    isDefault: memory.exportType === 'default',
                    from: memory.from
                })
            };

            const collectResults = (end = i) => {
                let i = exports.length;
                while (--i >= 0 && exports[i].exportIndex === exportIndex) {
                    exports[i].from = memory.from;
                    exports[i].exportEnd = end;
                }
            };

            let state = states.start;

            while (i < this.source.length) {
                let j;
                j = this.skipNonCode(i, cciObject);
                memory.nonCodeSkipped = i !== j;
                i = j;

                const currChar = this.source.charAt(i);
                const currCharCode = this.source.charCodeAt(i);

                switch (state) {
                    /**
                     * Checks export type
                     */
                    case states.start:
                        if (123 /* '{'.charCodeAt(0) */ === currCharCode) {
                            state = states.brackets.anything;
                            break;
                        }

                        if (42 /* '*'.charCodeAt(0) */ === currCharCode) {
                            memory.exportType = '*';
                            state = states.from;
                            saveVar();
                            break;
                        }

                        if ('let' === this.source.substr(i, 3) && StaticAnalyzer.jsDelimiterChars.indexOf(this.source.charCodeAt(i + 3)) !== -1) {
                            memory.exportType = 'let';
                            i += 2;
                            state = states.lcv.anything;
                            break;
                        }

                        if ('var' === this.source.substr(i, 3) && StaticAnalyzer.jsDelimiterChars.indexOf(this.source.charCodeAt(i + 3)) !== -1) {
                            memory.exportType = 'var';
                            i += 2;
                            state = states.lcv.anything;
                            break;
                        }

                        if ('const' === this.source.substr(i, 5) && StaticAnalyzer.jsDelimiterChars.indexOf(this.source.charCodeAt(i + 5)) !== -1) {
                            memory.exportType = 'const';
                            i += 4;
                            state = states.lcv.anything;
                            break;
                        }

                        if ('function' === this.source.substr(i, 8) && StaticAnalyzer.jsDelimiterChars.indexOf(this.source.charCodeAt(i + 8)) !== -1) {
                            memory.exportType = 'function';
                            i += 7;
                            let j;
                            j = this.skipNonCode(i + 1, cciObject);
                            if ('*'.charCodeAt(0) === this.source.charCodeAt(j)) {
                                i = j;
                                memory.exportType = 'function*';
                            }

                            state = states.fc.anything;
                            break;
                        }

                        if ('class' === this.source.substr(i, 5) && StaticAnalyzer.jsDelimiterChars.indexOf(this.source.charCodeAt(i + 5)) !== -1) {
                            memory.exportType = 'class';
                            i += 4;
                            state = states.fc.anything;
                            break;
                        }

                        if ('default' === this.source.substr(i, 7) && StaticAnalyzer.jsDelimiterChars.indexOf(this.source.charCodeAt(i + 7)) !== -1) {
                            memory.exportType = 'default';
                            state = states.end;
                            saveVar();
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
                        i = this.skipNonCode(i, cciObject);

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
                        i = this.skipNonCode(i, cciObject);

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
                        i = this.skipBrackets(i, cciObject);

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
                            const url = this._commentsAndStrings[this.nextString(i, cciObject)];
                            memory.from = this.source.substring(url[0] + 1, url[1] - 1);
                            return collectResults(url[1]);
                        }

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

        const rx = /(?:^|\s|\/|\)|\[|;|{|})(export)(?={|\s|\/)/gm;
        let match;
        let i = 0;
        while ((match = rx.exec(this.source))) {
            let curPos = match[0].indexOf('export') + match.index;
            if (this.isCommentOrString(curPos)) {
                continue;
            }
            analyzeExport(curPos, i++);
        }

        this.exports = exports;
    }

    findImports() {
        const cciObject = {cci: NaN};
        const imports = [];

        const analyzeImport = (i, importIndex) => {
            cciObject.cci = NaN;
            const importBeginning = i;
            i += 6;

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
                from: null,
                isFirstStart: true
            };

            const saveVar = () => {
                const name = memory.currVar.join('');
                const label = memory.currLabelLength > 0 ? memory.currLabel.join('') : name;

                memory.currVar.fill(undefined);
                memory.currLabel.fill(undefined);
                memory.currVarLength = 0;
                memory.currLabelLength = 0;

                imports.push({
                    importIndex,
                    importBeginning,
                    importEnd: memory.importEnd,
                    name,
                    label,
                    isBrackets: memory.importType === 'brackets',
                    isDefault: memory.importType === 'default',
                    isAll: memory.importType === '*',
                    isES5: memory.importType === 'es5',
                    from: memory.from
                })
            };

            const collectResults = () => {
                let i = imports.length;
                while (--i >= 0 && imports[i].importIndex === importIndex) {
                    imports[i].from = memory.from;
                    imports[i].importEnd = memory.importEnd;
                }
            };

            let state = states.start;

            let checkES5Import = true;
            while (i < this.source.length) {
                let j;
                j = this.skipNonCode(i, cciObject, 1, true, true, true, false);
                memory.nonCodeSkipped = i !== j;
                i = j;

                if (checkES5Import) {
                    const nextString = this._commentsAndStrings[this.nextString(i)];
                    if (i === nextString[0]) {
                        memory.importType = 'es5';
                        memory.importEnd = nextString[1];
                        memory.from = this.source.substring(nextString[0] + 1, nextString[1] - 1);
                        saveVar();
                        state = states.end;
                    }
                }

                checkES5Import = false;

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
                            memory.importEnd = url[1];
                            memory.from = this.source.substring(url[0] + 1, url[1] - 1);
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
                        i = this.skipNonCode(i, cciObject);

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
                        i -= 2;
                        state = states.default.var;
                        break;

                    case states.default.var:
                        if (StaticAnalyzer.jsDelimiterChars.indexOf(this.source.charCodeAt(i)) !== -1) {
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
                        memory.importType = '*';
                        i = this.skipNonCode(i, cciObject);
                        if (this.source.substr(i, 2) === 'as') {
                            i += 2;
                            state = states.all.var;
                            break;
                        }

                        break;

                    case states.all.var:
                        if (','.charCodeAt(i) === currChar.charCodeAt(0)) {
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

                        memory.currVar[0] = 'a';
                        memory.currVar[1] = 'l';
                        memory.currVar[2] = 'l';
                        memory.currVarLength = 3;
                        memory.currLabel[memory.currLabelLength++] = currChar;
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

        const rx = /(?:^|\s|\/|\)|\[|;|{|})(import)(?={|\s|\/)/gm;
        let match;
        let i = 0;
        while ((match = rx.exec(this.source))) {
            let curPos = match[0].indexOf(match[1]) + match.index;
            if (this.isCommentOrString(curPos) || this.findScope(curPos) !== 0) {
                continue;
            }

            analyzeImport(curPos, i++);
        }

        this.imports = imports;
    }

    findScope(index, scopeType = StaticAnalyzer.scopeTypes.es6, ignoreDestruction = false) {

        if (ignoreDestruction && scopeType === StaticAnalyzer.scopeTypes.es6) {
            const destructionIndex = this.getDestructionIndex(index);
            if (destructionIndex !== -1) {
                index = this._destructionScopes[destructionIndex][0];
            }
        }

        let opening = -1;
        let closing = -1;

        if (scopeType === StaticAnalyzer.scopeTypes.es6) {
            opening = binarySearchLowerBound(this._es6Scopes[0], index);
            closing = this._closingEs6ScopesSorted[1][binarySearchUpperBound(this._closingEs6ScopesSorted[0], index)];
        } else {
            opening = binarySearchLowerBound(this._es5Scopes[0], index);
            closing = this._closingEs5ScopesSorted[1][binarySearchUpperBound(this._closingEs5ScopesSorted[0], index)];
        }

        if (opening < 0 || closing < 0) {
            return 0;
        }

        if (scopeType === StaticAnalyzer.scopeTypes.es6) {
            return this._es6ScopeGraph.lca(opening, closing);
        }

        return this._es5ScopeMap[this._es5ScopeGraph.lca(opening, closing)];
    }

    analyzeFunctionParams() {
        this._functionParams = [[], []];
        const n_scopes = this._scopeData.length;
        let i = 0;

        // opening brackets must be sorted
        while (i < n_scopes) {
            const scope_data = this._scopeData[i];
            if (scope_data[1]) {
                this._functionParams[0].push(scope_data[1][0]);
                this._functionParams[1].push(scope_data[1][1]);
            }
            i++;
        }
    }

    isFunctionParam(index) {
        if (!this._functionParams) {
            this.analyzeFunctionParams();
        }

        let leftmostOpeningIndex = binarySearch(this._functionParams[0], index, true);

        do {
            if (this._functionParams[0][leftmostOpeningIndex] <= index && index <= this._functionParams[1][leftmostOpeningIndex]) {
                return true;
            }
            leftmostOpeningIndex--;
        } while (leftmostOpeningIndex >= 0);

        return false;
    };

    isAssignment(index) {
        let skippedIndex = this.skipNonCode(index, StaticAnalyzer.cOBJ);

        if (this.isSubstringInArray(skippedIndex, StaticAnalyzer.assignmentOperators)) {
            return true;
        }

        if (this.isSubstringInArray(skippedIndex, StaticAnalyzer.unaryOperators)) {
            return true;
        }

        skippedIndex = this.skipNonCode(index - 1, StaticAnalyzer.cOBJ, -1);
        const substr = this.source.substr(skippedIndex - 2, 2);
        return substr === '++' || substr === '--';
    };

    analyzeDestructionScopes() {
        this._destructionScopes = [];

        const n_destructions = this._destructions.length;
        let i = 0;
        while (i < n_destructions) {
            let destructionEnd = this._destructions[i];
            this._destructionScopes.push([this.skipBrackets(destructionEnd, StaticAnalyzer.cOBJ, false, true), destructionEnd]);
            i++;
        }
    }

    getDestructionIndex(index) {
        if (!this._destructionScopes) {
            this.analyzeDestructionScopes()
        }

        return binarySearchIntervals(this._destructionScopes, index);
    }

    findReferences(variable) {
        const rx = new RegExp('(?:^|\\s|=|\\+|\\-|\\/|\\*|\\%|\\(|\\)|\\[|;|:|{|}|\\n|\\r|,|!|&|\\||\\^|\\?|>|<)('
            + variable
            + ')(?=\\s|$|=|\\+|\\.|\\-|\\/|\\*|\\%|\\(|\\)|\\[|\\]|;|:|{|}|\\n|\\r|,|!|&|\\||\\^|\\?|>|<)', 'gm');
        let match;

        // might be a bug if there is a = somethingsomethingfunction* x, we will mistake this for a definition
        // probably need to check the other side too
        const declarationTypes = ['var', 'let', 'const', 'class', 'function', 'function*'];
        const declarationTypeScopes = [
            StaticAnalyzer.scopeTypes.es5,
            StaticAnalyzer.scopeTypes.es6,
            StaticAnalyzer.scopeTypes.es6,
            StaticAnalyzer.scopeTypes.es6,
            StaticAnalyzer.scopeTypes.es5,
            StaticAnalyzer.scopeTypes.es6
        ];

        const getDeclarationType = (index, scope = this.findScope(index), isOverride, params = {}) => {
            if (this.isFunctionParam(index)) {
                isOverride.value = false;
                return 'param';
            }

            const destructionIndex = this.getDestructionIndex(index);
            const endOfReference = destructionIndex !== -1 ? this._destructionScopes[destructionIndex][1] + 1 : this.getWordFromIndex(index)[1];
            isOverride.value = this.isAssignment(endOfReference);
            isOverride.index = endOfReference;

            if (destructionIndex !== -1) {
                index = this._destructionScopes[destructionIndex][0];
            }

            const scopeStart = scope === -1 ? 0 : this._es6Scopes[0][scope];
            index = this.skipNonCode(index - 1, StaticAnalyzer.cOBJ, -1);

            // multivariable case
            if (this.source.charCodeAt(index) === 44 /* ','.charCodeAt(0) */) {
                let beforeNewLine = false;

                while (index > scopeStart) {
                    const currCharCode = this.source.charCodeAt(index);

                    if (currCharCode === 59 /* ';'.charCodeAt(0) */) {
                        return null;
                    }

                    if (currCharCode === 10 && this.checkIfExpressionIsOver(index)) {
                        return null;
                    }

                    let [start, end] = this.getWordFromIndex(index);
                    if (!isNaN(start) && !isNaN(end)) {
                        const word = this.source.substring(start, end);
                        if (declarationTypes.indexOf(word) !== -1) {
                            return word;
                        }

                        index = start;
                    }

                    beforeNewLine = currCharCode === 10; // '\n'.charCodeAt(0)
                    index = this.skipNonCodeAndScopes(--index, StaticAnalyzer.cOBJ, -1, true, true, false);
                }

                if (index === scopeStart) {
                    return null;
                }
            }

            const declarationType = this.isSubstringInArray(index, declarationTypes, -1);

            if (declarationType) {
                params.start = index - declarationType.length;
            }
            return declarationType;
        };

        const references = [];
        const isOverride = {value: false};

        const isObject = (index) => {
            let start = index;
            let end = index;

            const params = {cci: NaN};
            while (start >= 0) {
                const cur = this.source.charCodeAt(start);
                if (StaticAnalyzer.jsDelimiterChars.indexOf(cur) !== -1) {
                    if (cur === '.'.charCodeAt(0))
                        return false;
                    if (cur === ','.charCodeAt(0) || cur === '{'.charCodeAt(0))
                        break;
                    else
                        return false;
                }

                start = this.skipNonCode(start - 1, params, -1);
            }

            while (end < this.source.length) {
                const cur = this.source.charCodeAt(end);
                if (StaticAnalyzer.jsDelimiterChars.indexOf(cur) !== -1) {
                    if (cur === ':'.charCodeAt(0))
                        break;
                    else
                        return false;
                }
                end = this.skipNonCode(end + 1, params);
            }

            return true;
        };

        const scopesToIgnore = new Int8Array(this._es6Scopes[0].length);
        while ((match = rx.exec(this.source))) {
            const index = match[0].indexOf(variable) + match.index;
            if (!this.isCommentOrString(index) && !isObject(index)) {
                const params = {start: -1};
                const declaration = getDeclarationType(index, this.findScope(index), isOverride, params);
                const scopeType = declarationTypeScopes[declarationTypes.indexOf(declaration)];
                const scope = this.findScope(index, scopeType, true);
                references.push({
                    index,
                    isOverride: Object.assign({}, isOverride),
                    declaration,
                    scope,
                    scopeType,
                    declarationStart: params.start
                });
                if (declaration && scope !== 0) {
                    this._es6ScopeGraph.dfs(scope => {
                        scopesToIgnore[scope] = 1;
                    }, scope);
                }
            }
        }

        const ret = [];
        for (let i = 0; i < references.length; i++) {
            const ref = references[i];
            if (scopesToIgnore[ref.scope])
                continue;

            ret.push(ref);
        }
        return ret;
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
        console.table(reshapeObject(this.exports))
    }

    visualizeImports() {
        console.table(this.imports)
    }

    printBrokenScopes() {
        const res = [];
        for (let i = 0; i < this._es6Scopes[0].length; i++)
            if (isNaN(this._es6Scopes[1][i]))
                res.push(this._es6Scopes[0][i]);
        for (let i in res) {
            console.log(this.source.substr(res[i], 100));
        }
    }

    printFunctionArguments() {
        const res = this._scopeData.filter(x => x[0] && (x[0] === StaticAnalyzer.scopeTypes.function || x[0] & StaticAnalyzer.scopeTypes.arrowFunction));
        const arrRes = [];
        for (let i in res) {
            if (!isNaN(res[i][1][0]) && !isNaN(res[i][1][1])) {
                arrRes.push(this.source.substring(res[i][1][0], res[i][1][1]));
            }
        }
        return arrRes.join('\n');
    }
}

StaticAnalyzer.cOBJ = {};
StaticAnalyzer.jsDelimiterChars = ['=', '+', '-', '/', '*', '%', '(', ')', '[', ';', ':', '{', '}', '\n', '\r', ',', '!', '&', '|', '^', '?', ' '].map(x => x.charCodeAt(0));
StaticAnalyzer.operatorChars = ['+', '-', '/', '*', '%', '>', '<', '&', '|', '^', '=', '?', ':', '~', '\n'].map(x => x.charCodeAt(0));
StaticAnalyzer.operatorWords = ['instanceof', 'delete', 'typeof', 'void', 'in'];
StaticAnalyzer.assignmentOperators = ['=', '+=', '-=', '*=', '/=', '%=', '&=', '^=', '|=', '**=', '>>=', '<<=', '>>>='];
StaticAnalyzer.unaryOperators = ['++', '--'];

StaticAnalyzer.scopeTypes = {
    es5: 0b00000000000,
    es6: 0b10000000000,
    singleStatement: 0b00100000000,
    expression: 0b00010000000,
    destruction: 0b11000000000,
    function: 0b00000000010,
    arrowFunction: 0b00000000100,
    for: 0b10000001000,
    if: 0b10000010000,
    while: 0b10000100000,
    do: 0b10001000000,
    class: 0b10010000000
};

StaticAnalyzer.globalScopeBracket = 11116666;