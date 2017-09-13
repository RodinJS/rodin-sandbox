let x = 10;

setInterval(() => {
    x++;
    console.log('test_import.js: x', x);
}, 2000);

export {x};