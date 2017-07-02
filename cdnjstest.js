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


const initTest = () => {
    const table = document.getElementById('table');
    const jTable = $('#table').DataTable({
        "responsive": true,
        data: []
    });


    const addRow = (...args) => {
        //table.innerHTML += `<tr> ${ args.map(i => "<td>" + i + "</td>").join("") } </tr>`;
        jTable.row.add(args).draw();
    };

    const setStatus = (curr, total) => {
        document.getElementById('status').innerHTML = `Tested ${ curr } of ${total}`;
    };

    const isJS = (url) => url.endsWith('.js');
    let isRunning = false;

    let total = null;
    let data = null;

    const loadFileNames = () => {
        ajax.get('https://api.cdnjs.com/libraries', {}, d => {
            data = JSON.parse(d);
            total = data.total;
            if (isRunning) {
                testAll();
            }
        });
    };


    document.getElementById('start').addEventListener('click', () => {
        isRunning = !isRunning;
        if (isRunning)
            document.getElementById('start').innerText = 'Pause';
        else
            document.getElementById('start').innerText = 'Resume';
        if (!isRunning)
            return;


        if (total) {
            testAll();
        }
        else {
            loadFileNames();
        }

    });

    let okCount = 0;
    let i = 0;
    let allCount = 0;

    const testAll = () => {
        if (total === null)
            return;


        const _runTest = () => {
            if (!isJS(data.results[i].latest)) {
                i++;
                return setTimeout(_runTest, 50);
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
                i++;
                allCount++;
                document.getElementById('status').innerText = `${okCount} / ${allCount}, ${parseInt(okCount / allCount * 1000) / 10}%`;
                if (i < total && isRunning) {
                    setTimeout(_runTest, 50);
                }


            });
        };


        _runTest();
        window.data = data;

    }

};


initTest();