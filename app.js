const app = new sandbox('test2.js', sandbox.types.EXPORT_WINDOW_SCOPE, {window_export: 132});
app.on('ready', () => {
	console.log(app.exports, app.scope);
});


// const three86Sandbox = new sandbox('https://cdnjs.cloudflare.com/ajax/libs/three.js/86/three.min.js', sandbox.types.EXPORT_WINDOW_SCOPE, {camels: true});
//
// container86 = document.createElement('canvas');
// document.body.appendChild(container86);
//
// three86Sandbox.on('ready', () => {
// 	//console.log(Object.assign({container: container86}, three86Sandbox.scope));
//
// 	const app = new sandbox('test.js', sandbox.types.EXPORT_WINDOW_SCOPE, Object.assign({container: container86}, three86Sandbox.scope));
// 	app.on('ready', () => {
// 		console.log(app.exports);
// 	});
// });
//
//
// const three80Sandbox = new sandbox('https://cdnjs.cloudflare.com/ajax/libs/three.js/80/three.min.js', sandbox.types.EXPORT_WINDOW_SCOPE, {camels: true});
//
// container80 = document.createElement('canvas');
// document.body.appendChild(container80);
//
// three80Sandbox.on('ready', () => {
// 	//console.log(Object.assign({container: container80}, three80Sandbox.scope));
// 	const app = new sandbox('test.js', sandbox.types.EXPORT_WINDOW_SCOPE, Object.assign({container: container80}, three80Sandbox.scope));
// 	app.on('ready', () => {
// 		console.log(app.exports);
// 	});
// });