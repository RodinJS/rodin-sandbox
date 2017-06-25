import {camel_dependency, other_dependency} from 'test_import.js';
import * as second_dependency from 'test_import2.js';

sandbox_exports.camel = true;
console.log('we are inside the app');
console.log(camel_dependency, other_dependency);

console.log(sandbox_exports);
console.log(second_dependency);


// sandbox_import([{
// 	url: 'test_import.js',
// 	obj: ['camel_dependency', 'other_dependency']
// }], function (camel_dependency, other_dependency) {
// 	sandbox_exports.camel = true;
// 	console.log('we are inside the app');
// 	console.log(camel_dependency, other_dependency);
//
// 	console.log(sandbox_exports);
// });