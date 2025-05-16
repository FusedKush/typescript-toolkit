# `arrays`
Utility tools for working with [Dynamic-Length Arrays](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).


## Tool List
- [`arrayify`](arrayify): Convert the specified type or value into an array, if it is not one already.
- [`toListString`](toListString): Convert the specified array to a `string` containing a deliminator-separated list of the elements in the array.


## NPM Package Usage
You can directly import tools into your project:
```ts
// These imports are all equivalent
import toListString from "typescript-toolkit/arrays/toListString";
import * as arrayifyNs from "typescript-toolkit/arrays/arrayify";
import { ArrayifyType, arrayify } from "typescript-toolkit/arrays";

type ArrayifiedFoo = arrayifyNs.ArrayifyType<string>;
type ArrayifiedBar = ArrayifyType<number[]>;
var arrayifiedFoo = arrayifyNs.arrayify(42);
var arrayifiedBar = arrayify(["Hello", "World!"]);
const listStr = toListString(["foo", "bar", "baz"]);
```

You can also import the namespace into your project:
```ts
// These imports are all equivalent
import { arrays } from "typescript-toolkit";
import arrays from "typescript-toolkit/arrays";
import * as arrays from "typescript-toolkit/arrays";

type ArrayifiedFoo = arrays.ArrayifyType<string>;
type ArrayifiedBar = arrays.ArrayifyType<number[]>;
var arrayifiedFoo = arrays.arrayify(42);
var arrayifiedBar = arrays.arrayify(["Hello", "World!"]);
const listStr = arrays.toListString(["foo", "bar", "baz"]);
```

For JavaScript projects, you can use [`import()` types](https://www.typescriptlang.org/docs/handbook/modules/reference.html#import-types) or the [`@import` tag](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import) to import the namespace or individual types:
```js
/**
 * @typedef {import("typescript-toolkit/arrays").ArrayifyType<string>} ArrayifiedFoo
 */
/**
 * @typedef {import("typescript-toolkit").arrays.ArrayifyType<number[]>} ArrayifiedBar
 */

/**
 * @import * as ns from "typescript-toolkit/arrays/arrayify"
 */
/**
 * @import { ArrayifyType } from "typescript-toolkit/arrays"
 */
/**
 * @typedef {ns.ArrayifyType<string>} ArrayifiedFoo
 */
/**
 * @typedef {ArrayifyType<number[]>} ArrayifiedBar
 */

/**
 * @import { arrays } from "typescript-toolkit"
 * @import arrays from "typescript-toolkit/arrays"
 */
/**
 * @template T
 * @typedef {arrays.ArrayifyType<T>} ArrayifiedFoobar
 */
```


## Changelog
- [`1.0.0`](https://github.com/FusedKush/typescript-toolkit/releases/1.0.0):
  - Added `arrays`
  - Added [`arrayify`](arrayify)
  - Added [`toListString`](toListString)