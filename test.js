import 'https://cdnjs.cloudflare.com/ajax/libs/three.js/87/three.js';
import 'http://192.168.0.31:8000/dist/vendor/vendor.js';

import * as RODIN from 'http://192.168.0.31:8000/src/core/index.js';

RODIN.start();

const box = new RODIN.Box(new THREE.MeshNormalMaterial());

box.on(RODIN.CONST.UPDATE, () => {
    box.rotation.x += .001 * RODIN.Time.delta;
    box.rotation.y += .001 * RODIN.Time.delta;
});

box.position.set(0, 1.6, -2);
RODIN.Scene.add(box);