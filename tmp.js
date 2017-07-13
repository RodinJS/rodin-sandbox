//
// let name1 = 1;
// let name2 = 1;
// const name1111 = 123;
// let name2111 = 1;
// let variable1 = 1;
// let variable2 = 1;
// let variable21 = 1;
// let variable11 = 1;
// export { name1, name2};
// export { variable1 as FooAction, variable2 as BarAction };
// export let name11, name21 ; // also var
// export let name111 = 1, name211 = 2; // also var, const
//
//
// export default function (a) { console.log(a); } // also class, function*
// export default class a1 {} //
// export default function name1(a1) {console.log(a1);} // also class, function*
// export { name1111 as default };
//
// export {FooAction, BarAction} from './tmp.js'
// export * from './tmp.js';
// export { FooAction as name1, BarAction as name2, variable1 }  from './tmp.js';
//
//
// export const foo = Math.sqrt(2); // exports a constant
// export default function() {} // or 'export default class {}'
// // export several values. During the import, one will be able to use the same name
//
// export default variable21;
// // module "my-module.js"
// function cube(x) {
//     return x * x * x;
// }
// const foo = Math.PI + Math.SQRT2;
// export { cube, foo };
//
//
// // module "my-module.js"
// export default function cube(x) {
//     return x * x * x;
// }
//
// export function f() {
//     return 8;
// }
//
// export class X {}
//
// export function    * asd() {
//
// }
//
// export function f1() {}
//
// export let x = 10, y = 20;
//
// export {x
// as
// y};
//
// const as = 10;
// export {as as y};
//

const aasd = 10;
const b = 29;

export {aasd/*aasdasd*/ as x, b /*asdasdas */}
export {b as default}

export let x = 10, y = 20, z,
    a = 20;

export {aasd/***/as x}

export let/***/x, /*asdasd*/asd, /*
asdasd
*/z;

export const x = 20, y = 30;

export/**/default x / 5;

export function fasdasd(asd, asad) {

}

export function/*   */ /**//**/*www() {

}

export class X {}

export {x}/**/from /*asd*/ 'asd'

export * from 'uxt';