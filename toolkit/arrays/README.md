# `arrays`
Utility tools for working with [Dynamic-Length Arrays](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).


## NPM Package Usage
You can directly import tools into your project:
```ts
// These imports are all equivalent
import Example from "typescript-toolkit/arrays/example";
import * as Example from "typescript-toolkit/arrays/example";
import { Example } from "typescript-toolkit/arrays";

type Test = Example<true>;
```

You can also import the namespace into your project:
```ts
// These imports are all equivalent
import { arrays } from "typescript-toolkit";
import arrays from "typescript-toolkit/arrays";
import * as arrays from "typescript-toolkit/arrays";

type Test = arrays.Example<true>;
```

For JavaScript projects, you can use [`import()` types](https://www.typescriptlang.org/docs/handbook/modules/reference.html#import-types) or the [`@import` tag](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import) to import the namespace or individual types:
```js
/**
 * @typedef {import("typescript-toolkit/arrays").Example<true>} Test
 */
/**
 * @typedef {import("typescript-toolkit").arrays.Example<true>} Test
 */

/**
 * @import Example from "typescript-toolkit/arrays/example"
 * @import { Example } from "typescript-toolkit/arrays"
 */
/**
 * @typedef {Example<true>} Test
 */

/**
 * @import { arrays } from "typescript-toolkit"
 * @import arrays from "typescript-toolkit/arrays"
 */
/**
 * @typedef {arrays.Example<true>} Test
 */
```


## Changelog
- [`1.0.0`](https://github.com/FusedKush/typescript-toolkit/tree/releases/1.0.0):
  - Added `arrays`
