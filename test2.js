import {camel_dependency as some_other_stuff, other_dependency} from 'test_import.js';
import * as second_dependency from 'test_import2.js';

console.log('we are inside the app');
console.log(some_other_stuff, other_dependency);
console.log(second_dependency);

console.log(window_export);

export{second_dependency};

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