// test.js
make_imports_work_and_shit([],(function (_exports, _setters, ){

    for(let i in _setters) {
        _setters[i].from.on('valuechange', evt => {
            if(!_setters[i].imports[evt.label]) return;
            let shouldEmit = eval(`${evt.label} !== evt.newValue`);
            eval(`${evt.label} = evt.newValue`);
            if(shouldEmit && file.exportedValues.hasOwnProperty(evt.label)) {
                file.exportedValues[evt.label] = evt.newValue;
            }
        })
    }
    // import 'https://cdnjs.cloudflare.com/ajax/libs/three.js/87/three.js';
// import 'http://192.168.0.31:8000/dist/vendor/vendor.js';
//
// import * as RODIN from 'http://192.168.0.31:8000/src/core/index.js';
// window.R = RODIN;
// RODIN.start();
// console.log(RODIN);
//
// const box = new RODIN.Box(new THREE.MeshNormalMaterial());
// RODIN.Scene.add(box);
// box.position.z = -5;
// box.on(RODIN.CONST.UPDATE, () => {
//     box.rotation.y += 0.001 * RODIN.Time.delta;
//     box.rotation.z += 0.001 * RODIN.Time.delta;
// });
//

// debugger;

import 'test2.js';

    console.log('here');
    setInterval(() => {
        console.log('timeout');
    }, 100);

}))