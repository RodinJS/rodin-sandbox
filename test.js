// import {a} from 'uxt';
//
// uxt.call();
//
// sandbox_import([{f: 'filename', o: {'x': 'x', 'y': 'z'}}], function (a) {
//
// });
//

var stats;
var camera, scene, renderer;
var pointLight;
var objects = [], materials = [];


/**
 * need to get rid of this and somehow
 * assign everything to the global scope here
 * Maybe use window but there must be a better solution
 */
const THREE = this.THREE;
const container = this.container;
sandbox_import();

sandbox_exports.stuff = 'all the things';

init();
animate();

function init() {
	camera = new THREE.PerspectiveCamera(45, 1, 1, 2000);
	camera.position.set(0, 200, 800);
	scene = new THREE.Scene();
	// Grid
	var helper = new THREE.GridHelper(1000, 40, 0x303030, 0x303030);
	helper.position.y = -75;
	scene.add(helper);
	// Materials


	materials.push(new THREE.MeshLambertMaterial({transparent: true}));
	materials.push(new THREE.MeshLambertMaterial({color: 0xdddddd, shading: THREE.FlatShading}));
	materials.push(new THREE.MeshPhongMaterial({
		color: 0xdddddd,
		specular: 0x009900,
		shininess: 30,
		shading: THREE.FlatShading
	}));
	materials.push(new THREE.MeshNormalMaterial());
	materials.push(new THREE.MeshBasicMaterial({color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending}));
	//materials.push( new THREE.MeshBasicMaterial( { color: 0xff0000, blending: THREE.SubtractiveBlending } ) );
	materials.push(new THREE.MeshLambertMaterial({color: 0xdddddd, shading: THREE.SmoothShading}));
	materials.push(new THREE.MeshPhongMaterial({
		color: 0xdddddd,
		specular: 0x009900,
		shininess: 30,
		shading: THREE.SmoothShading,
		transparent: true
	}));
	materials.push(new THREE.MeshNormalMaterial({shading: THREE.SmoothShading}));
	materials.push(new THREE.MeshBasicMaterial({color: 0xffaa00, wireframe: true}));
	materials.push(new THREE.MeshDepthMaterial());
	materials.push(new THREE.MeshLambertMaterial({color: 0x666666, emissive: 0xff0000, shading: THREE.SmoothShading}));
	materials.push(new THREE.MeshPhongMaterial({
		color: 0x000000,
		specular: 0x666666,
		emissive: 0xff0000,
		shininess: 10,
		shading: THREE.SmoothShading,
		opacity: 0.9,
		transparent: true
	}));
	materials.push(new THREE.MeshBasicMaterial({transparent: true}));
	// Spheres geometry
	var geometry = new THREE.SphereGeometry(70, 32, 16);
	for (var i = 0, l = geometry.faces.length; i < l; i++) {
		var face = geometry.faces[i];
		face.materialIndex = Math.floor(Math.random() * materials.length);
	}
	geometry.sortFacesByMaterialIndex();
	objects = [];
	for (var i = 0, l = materials.length; i < l; i++) {
		addMesh(geometry, materials[i]);
	}
	addMesh(geometry, materials);
	// Lights
	scene.add(new THREE.AmbientLight(0x111111));
	var directionalLight = new THREE.DirectionalLight(0xffffff, 0.125);
	directionalLight.position.x = Math.random() - 0.5;
	directionalLight.position.y = Math.random() - 0.5;
	directionalLight.position.z = Math.random() - 0.5;
	directionalLight.position.normalize();
	scene.add(directionalLight);
	pointLight = new THREE.PointLight(0xffffff, 1);
	scene.add(pointLight);
	pointLight.add(new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({color: 0xffffff})));
	//
	renderer = new THREE.WebGLRenderer({antialias: true, canvas: container});
	renderer.setPixelRatio(1);
	renderer.setSize(400, 400);

}
function addMesh(geometry, material) {
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.x = ( objects.length % 4 ) * 200 - 400;
	mesh.position.z = Math.floor(objects.length / 4) * 200 - 200;
	mesh.rotation.x = Math.random() * 200 - 100;
	mesh.rotation.y = Math.random() * 200 - 100;
	mesh.rotation.z = Math.random() * 200 - 100;
	objects.push(mesh);
	scene.add(mesh);
}

//
function animate() {
	requestAnimationFrame(animate);
	render();
}
function render() {
	var timer = 0.0001 * Date.now();
	camera.position.x = Math.cos(timer) * 1000;
	camera.position.z = Math.sin(timer) * 1000;
	camera.lookAt(scene.position);
	for (var i = 0, l = objects.length; i < l; i++) {
		var object = objects[i];
		object.rotation.x += 0.01;
		object.rotation.y += 0.005;
	}
	materials[materials.length - 2].emissive.setHSL(0.54, 1, 0.35 * ( 0.5 + 0.5 * Math.sin(35 * timer) ));
	materials[materials.length - 3].emissive.setHSL(0.04, 1, 0.35 * ( 0.5 + 0.5 * Math.cos(35 * timer) ));
	pointLight.position.x = Math.sin(timer * 7) * 300;
	pointLight.position.y = Math.cos(timer * 5) * 400;
	pointLight.position.z = Math.cos(timer * 3) * 300;
	renderer.render(scene, camera);
}
