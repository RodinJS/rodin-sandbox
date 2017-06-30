const runTest = (url, callback) => {
    let source = '';

    ajax.get(url, {}, data => {
        const res = {};
        source = data;
        let a = new StaticAnalyzer(source);
        let t = null;

        res['length'] = data.length;

        t = Date.now();
        a.analyzeCommentsAndStrings();
        res['commentAnalysis'] = Date.now() - t;

        t = Date.now();
        a.analyzeScopes();
        res['scopeAnalysis'] = Date.now() - t;

        const str = needles.map(a => a[1]).join('');

        res['openingBracketCount'] = find(str, '{').length;
        res['closingBracketCount'] = find(str, '}').length;

        try {
            eval(str);
        } catch (err) {
            res['evalError'] = err;
        }

        callback(res);

    }, true);

};


const startTest = () => {
    const table = document.getElementById('table');

    const addRow = (...args) => {
        table.innerHTML += `<tr> ${ args.map(i => "<td>" + i + "</td>").join("") } </tr>`;
    };

    const setStatus = (curr, total) => {
        document.getElementById('status').innerHTML = `Tested ${ curr } of ${total}`;
    };

    const isJS = (url) => url.endsWith('.js');

    ajax.get('https://api.cdnjs.com/libraries', {}, data => {
        data = JSON.parse(data);
        const total = data.total;
        let okCount = 0;

        let i = 0;
        const _runTest = () => {
            if (!isJS(data.results[i].latest)) {
                i++;
                return _runTest();
            }

            runTest(data.results[i].latest, (res) => {

                addRow(data.results[i].name,
                    data.results[i].latest,
                    res['length'], res['openingBracketCount'],
                    res['closingBracketCount'],
                    res['evalError'] || 'ok');

                if (!res['evalError']) {
                    okCount++;
                }
                document.getElementById('status').innerText = `${okCount} / ${i}, ${parseInt(okCount / i * 1000) / 10}%`;
                i++;
                if (i < total) {
                    _runTest();
                }
            });
        };


        _runTest();
        window.data = data;

    })
};

document.getElementById('start').addEventListener('click', startTest);