# `arrays/arrayify`
Convert the specified type or value into an array, if it is not one already.

```ts
type Foo = 42;
type Bar = ['foo', 'bar'];
type ArrayifiedFoo = ArrayifyType<Foo>;  // [42]
type ArrayifiedBar = ArrayifyType<Bar>;  // ['foo', 'bar']

var foo = true;
var bar = [1, 2, 3];
var arrayifiedFoo = arrayify(foo);       // [true]
var arrayifiedBar = arrayify(bar);       // [1, 2, 3]

type Foobar <T extends string | string[]> = ArrayifyType<T>[number];
const foobar = ( numbers: number | number[] ): number => arrayify(numbers).length;
```


## Information
- **Author**: [Zach Vaughan (FusedKush)](https://github.com/FusedKush)
- **Depends On**: _None_
- **Dependents**: _None_


## NPM Package Usage
You can directly import the tool into your project:
```ts
// These imports are all equivalent
import arrayify from "typescript-toolkit/arrays/arrayify";
import * as arrayifyNs from "typescript-toolkit/arrays/arrayify";
import { ArrayifyType, arrayify } from "typescript-toolkit/arrays";

type ArrayifiedFoo = arrayifyNs.ArrayifyType<string>;
type ArrayifiedBar = ArrayifyType<number[]>;
var arrayifiedFoo = arrayifyNs.arrayify(42);
var arrayifiedBar = arrayify(["Hello", "World!"]);
```

You can also import the enclosing namespace into your project:
```ts
// These imports are all equivalent
import { arrays } from "typescript-toolkit";
import arrays from "typescript-toolkit/arrays";
import * as arrays from "typescript-toolkit/arrays";

type ArrayifiedFoo = arrays.ArrayifyType<string>;
type ArrayifiedBar = arrays.ArrayifyType<number[]>;
var arrayifiedFoo = arrays.arrayify(42);
var arrayifiedBar = arrays.arrayify(["Hello", "World!"]);
```

For JavaScript projects, you can use [`import()` types](https://www.typescriptlang.org/docs/handbook/modules/reference.html#import-types) or the [`@import` tag](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import) to virtually import individual types or the parent namespace:
```js
/**
 * @typedef {import("typescript-toolkit/arrays").ArrayifyType<string>} ArrayifiedFoo
 */
/**
 * @typedef {import("typescript-toolkit").arrays.ArrayifyType<number[]>} ArrayifiedBar
 */

/**
 * @import * as arrayifyNs from "typescript-toolkit/arrays/arrayify"
 */
/**
 * @import { ArrayifyType } from "typescript-toolkit/arrays"
 */
/**
 * @typedef {arrayifyNs.ArrayifyType<string>} ArrayifiedFoo
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
- [`1.0.0`](https://github.com/FusedKush/typescript-toolkit/releases/1.0.0): Added