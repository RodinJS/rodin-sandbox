export const isAbsolute = (path) => path.startsWith('/') || path.startsWith('http://') || path.startsWith('https://');

export const join = (...args) => normalize(args.filter(i => i !== '').map(ignoreQueryString).join('/'));

export const getDirectory = (path) => {
    path = ignoreQueryString(path);
    return path.substring(0, path.lastIndexOf('/'));
};

export const getFile = (path) => {
    path = ignoreQueryString(path);
    return path.substring(path.lastIndexOf('/'));
};

export const ignoreQueryString = (path) => {
    if(path.indexOf('?') === -1) return path;

    return path.substring(0, path.indexOf('?'));s
};

export const normalize = (path) => {
    let absolutePrefix = '';
    if (isAbsolute(path)) {
        for (let i of ['/', 'http://', 'https://']) {
            if (path.startsWith(i)) {
                path = path.substring(i.length);
                absolutePrefix = i;
            }
        }
    }

    const paths = path.split('/');
    const res = [];
    for (let i = 0; i < paths.length; i++) {
        switch (paths[i]) {
            case '.':
            case '':
                break;
            case '..':
                res.pop();
                break;
            default:
                res.push(paths[i]);
        }
    }

    return absolutePrefix + res.join('/');
};
