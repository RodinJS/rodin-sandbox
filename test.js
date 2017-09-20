// import {x} from 'test2.js';
//
// console.log(x);

// import {} from 'tmp.js';
// setInterval(() => console.log('test', x), 1000);

import 'https://cdnjs.cloudflare.com/ajax/libs/three.js/87/three.js';

// import 'http://192.168.0.31:8000/dist/vendor/vendor.js';
import * as RODIN from 'http://192.168.0.31:8000/src/core/index.js';

RODIN.start();
console.log(RODIN);

const box = new RODIN.Box();
RODIN.Scene.add(box);
box.position.z = -5;
box.on(RODIN.CONST.UPDATE, () => {
    box.rotation.y += 0.001 * RODIN.Time.delta;
    box.rotation.z += 0.001 * RODIN.Time.delta;
});

