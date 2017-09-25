
const _request = function () {
    if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
    }
    const versions = [
        "MSXML2.XmlHttp.6.0",
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    let xhr;
    for (let i = 0; i < versions.length; i++) {
        try {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) {
        }
    }
    return xhr;
};

const _send = function (url, method, data = {}, async = true) {
    return new Promise((resolve, reject) => {

        const request = _request();
        request.open(method, url, async);

        request.addEventListener('load', (event) => {
            const response = event.target.response;

            if (request.status === 200 || request.status === 0) {
                resolve(response);
            } else {
                reject(event);
            }

        }, false);

        request.addEventListener('error', (event) => {
            reject(event);
        }, false);


        if (method === 'POST') {
            request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }

        request.send(data)
    });
};

export const get = function (url, data, async = true) {
    const query = [];
    for (let key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    return _send(url + (query.length ? '?' + query.join('&') : ''), 'GET', null, async);
};

export const post = function (url, data, callback, async) {
    const query = [];
    for (let key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    return _send(url, 'POST', query.join('&'), async);
};
