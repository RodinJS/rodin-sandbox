// import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/87/three.module.js';
//
// const canvas = document.createElement("canvas");
// document.body.appendChild(canvas)
//
// const renderer = new THREE.WebGLRenderer({
//     canvas: canvas
// });
// const camera = new THREE.PerspectiveCamera(
//     45,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     10000
// );
// const scene = new THREE.Scene();
// camera.position.set(0, 0, 0);
// scene.add(camera);
// renderer.setClearColor(0xaaaaaa);
//
// renderer.setSize(canvas.width, canvas.height);
//
// // const sphereMaterial = new THREE.ShaderMaterial({
// //     vertexShader: vertexShader,
// //     fragmentShader: fragmentShader
// // });
//
//
// const sphereMaterial = new THREE.MeshBasicMaterial({color: '#ff0000', wireframe: true});
//
// let lights = [];
// lights[0] = new THREE.PointLight(0xffffff, 0.5, 0);
// lights[1] = new THREE.PointLight(0xffffff, 0.7, 0);
// lights[2] = new THREE.PointLight(0xffffff, 0.7, 0);
//
// lights[0].position.set(0, 20, 0);
// lights[1].position.set(10, 20, 10);
// lights[2].position.set(-10, -20, -10);
//
// for (let i in lights) {
//     scene.add(lights[i]);
// }
//
// const icosahedronMaterial = new THREE.MeshPhongMaterial({
//     color: 0x156289,
//     side: THREE.FrontSide,
//     // transparent: true,
//     // opacity: 1,
//     emissive: 0x072534,
//     shading: THREE.FlatShading,
//     vertexColors: THREE.FaceColors,
//     depthTest: true
// });
//
// const lambertMaterial = new THREE.MeshLambertMaterial({});
//
// const container = new THREE.Object3D();
// container.position.set(0, 0, -40);
// for (let i = 0; i < 300; i++) {
//     const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), icosahedronMaterial);
//     icosahedron.position.z = Math.random() * 20;
//     icosahedron.position.x = (Math.random() - 0.5) * 20;
//     icosahedron.position.y = (Math.random() - 0.5) * 20;
//     container.add(icosahedron);
// }
//
// const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(5, 2), icosahedronMaterial);
// // const icosahedron = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4, 2, 2, 2), icosahedronMaterial);
//
// container.add(icosahedron);
//
// scene.add(container);
//
// let averageFps = 0;
// let numFrames = 0;
// let startTime = Date.now();
//
// const renderLoop = () => {
//     const curTime = Date.now();
//     const delta = 0.001 * (curTime - startTime);
//
//     container.rotation.z += delta;
//     container.rotation.y += delta;
//
//     renderer.render(scene, camera);
//
//     averageFps = ((averageFps * numFrames) + 1000 / (curTime - startTime)) / ++numFrames;
//     startTime = curTime;
//     requestAnimationFrame(renderLoop);
// };
// requestAnimationFrame(renderLoop);


import {x} from 'test_import.js';

console.log(x);