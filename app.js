const threeSandbox = new sandbox('https://cdnjs.cloudflare.com/ajax/libs/three.js/86/three.min.js', {camels: true});

container = document.createElement('canvas');
document.body.appendChild(container);

threeSandbox.on('ready', () => {
	console.log(Object.assign({container: container}, threeSandbox.scope));
	const app = new sandbox('test.js', Object.assign({container: container}, threeSandbox.scope));
});