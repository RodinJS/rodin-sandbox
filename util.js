// maybe use js log? idk need to check
const getLog = (n) => {
    let res = 1;
    while ((1 << res) <= n)  ++res;
    return res;
};

const getLCA = (graph) => {
    const n = graph.length;

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
        if (isParent(a, b))  return a;
        if (isParent(b, a))  return b;
        for (let i = log; i >= 0; --i)
            if (!isParent(up[a][i], b))
                a = up[a][i];
        return up[a][0];
    };

    return lca;
};