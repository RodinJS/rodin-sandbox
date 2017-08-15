/**
 * Finds the last element in the array which is not smaller than key
 * @param array
 * @param value
 * @return {number}
 */
function binarySearchLowerBound(array, value) {
    let low = 0;
    let high = array.length - 1;
    let mid;
    while (low <= high) {
        mid = (low + high) >> 1;
        if (array[mid] === value) {
            return mid;
        }
        else if (array[mid] < value) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    return high;
}

/**
 * Finds the first element in the array which is greater than key
 * @param array
 * @param value
 * @return {number}
 */
function binarySearchUpperBound(array, value) {
    let low = 0;
    let high = array.length - 1;
    let mid;
    while (low <= high) {
        mid = (low + high) >> 1;
        if (array[mid] === value) {
            return mid;
        }
        else if (array[mid] < value) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    return low > array.length - 1 ? -1 : low;
}


// maybe use js log? idk need to check
const getLog = (n) => {
    let res = 1;
    while ((1 << res) <= n) ++res;
    return res;
};

class Graph {
    constructor(graph) {
        this._graph = graph;
        this._isAnalyzed = false;
    }

    analyze() {
        const n = this._graph.length;
        this._parentMap = new Array(n).fill(NaN);
        this._dfsEnter = new Array(n);
        this._dfsExit = new Array(n);

        this._up = new Array(n);
        this._log = getLog(n);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < this._graph[i].length; j++) {
                this._parentMap[this._graph[i][j]] = i;
            }
        }

        const log = getLog(n);
        for (let i = 0; i < n; i++) {
            this._up[i] = new Array(log + 1);
        }

        let timer = 0;
        const dfs = (v, p = 0) => {
            this._dfsEnter[v] = ++timer;
            this._up[v][0] = p;
            for (let i = 1; i <= log; ++i) {
                this._up[v][i] = this._up[this._up[v][i - 1]][i - 1];
            }
            for (let i = 0; i < this._graph[v].length; ++i) {
                const to = this._graph[v][i];
                if (to != p) {
                    dfs(to, v);
                }
            }
            this._dfsExit[v] = ++timer;
        };

        dfs(0);


        this._isAnalyzed = true;
    }

    isParent(a, b) {
        return this._dfsEnter[a] <= this._dfsEnter[b] && this._dfsExit[a] >= this._dfsExit[b];
    }

    lca(a, b) {
        if (this.isParent(a, b)) return a;
        if (this.isParent(b, a)) return b;
        for (let i = this._log; i >= 0; --i)
            if (!this.isParent(this._up[a][i], b))
                a = this._up[a][i];
        return this._up[a][0];
    }

    getParent(a) {
        return this._parentMap[a];
    }

    dfs(fcn, v = 0) {
        for (let i = 0; i < this._graph[v].length; ++i) {
            const to = this._graph[v][i];
            if (to != p) {
                this.dfs(fcn, v);
            }
        }
    }
}

const getLCA = (graph) => {
    const n = graph.length;
    const parentMap = new Array(n).fill(NaN);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < graph[i].length; j++) {
            parentMap[graph[i][j]] = i;
        }
    }

    const dfsEnter = new Array(n);
    const dfsExit = new Array(n);

    const up = new Array(n);


    const log = getLog(n);
    for (let i = 0; i < n; i++) {
        up[i] = new Array(log + 1);
    }

    let timer = 0;
    const dfs = (v, p = 0) => {
        dfsEnter[v] = ++timer;
        up[v][0] = p;
        for (let i = 1; i <= log; ++i) {
            up[v][i] = up[up[v][i - 1]][i - 1];
        }
        for (let i = 0; i < graph[v].length; ++i) {
            const to = graph[v][i];
            if (to != p) {
                dfs(to, v);
            }
        }
        dfsExit[v] = ++timer;
    };

    const isParent = (a, b) => {
        return dfsEnter[a] <= dfsEnter[b] && dfsExit[a] >= dfsExit[b];
    };

    dfs(0);

    const lca = (a, b) => {
        if (isParent(a, b)) return a;
        if (isParent(b, a)) return b;
        for (let i = log; i >= 0; --i)
            if (!isParent(up[a][i], b))
                a = up[a][i];
        return up[a][0];
    };

    const getParent = (a) => {
        return parentMap[a];
    };

    return {lca, isParent, getParent};
};