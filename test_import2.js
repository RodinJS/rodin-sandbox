const camel_dependency = 14;
const other_dependency = 'this is yet another dependency of ours';

export {camel_dependency as a, other_dependency as b};

console.log('we are inside the second dependency');
