# `arrays`
Utility tools for working with [Dynamic-Length Arrays](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).


## Tool List
- [`arrayify`](arrayify): Convert the specified type or value into an array, if it is not one already.


## NPM Package Usage
You can directly import tools into your project:
```ts
// These imports are all equivalent
import arrayify from "typescript-toolkit/arrays/arrayify";
import * as ns from "typescript-toolkit/arrays/arrayify";
import { ArrayifyType, arrayify } from "typescript-toolkit/arrays";

type ArrayifiedFoo = ns.ArrayifyType<string>;
type ArrayifiedBar = ArrayifyType<number[]>;
var arrayifiedFoo = ns.arrayify(42);
var arrayifiedBar = arrayify(["Hello", "World!"]);
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
```

For JavaScript projects, you can use [`import()` types](https://www.typescriptlang.org/docs/handbook/modules/reference.html#import-types) or the [`@import` tag](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import) to import the namespace or individual types:
```js
/**
 * @typedef {import("typescript-toolkit/types").IsAny<any>} IsAnyType
 */
/**
 * @typedef {import("typescript-toolkit").types.UnionToIntersection<{ foo: string; } | { bar: number; }>} IntersectionObject
 */
/**
 * @typedef {import("typescript-toolkit/types/baseTypes").BaseType<"number">} BaseTypeUnion
 */

/**
 * @import IsAny from "typescript-toolkit/types/isAny"
 * @import { UnionToIntersection } from "typescript-toolkit/types"
 * @import * as baseTypes from "typescript-toolkit/types/baseTypes"
 */
/**
 * @typedef {IsAny<any>} IsAnyType
 */
/**
 * @typedef {UnionToIntersection<{ foo: string; } | { bar: number; }>} IntersectionObject
 */
/**
 * @typedef {baseTypes.BaseTypeString<"Hello, World!">} BaseTypeStringUnion
 */

/**
 * @import { types } from "typescript-toolkit"
 * @import * as types from "typescript-toolkit/types"
 */
/**
 * @typedef {types.IsAny<any>} IsAnyType
 */
/**
 * @typedef {types.UnionToIntersection<{ foo: string; } | { bar: number; }>} IntersectionObject
 */
/**
 * @typedef {types.BaseType<"number" | "null">} BaseTypeUnion
 */
```


## Changelog
- [`1.0.0`](https://github.com/FusedKush/typescript-toolkit/releases/1.0.0):
  - Added `arrays`
  - Added [`arrayify`](arrayify)
