# `types`
General-Purpose TypeScript Helper Types.


## Tool List
- [`isAny`](./isAny/)
- [`unionToIntersection`](./unionToIntersection/)


## NPM Package Usage
You can directly import tools into your project:
```ts
// These imports are all equivalent
import IsAny from "typescript-toolkit/types/isAny";
import * as UnionToIntersection from "typescript-toolkit/types/unionToIntersection";
import { IsAny, UnionToIntersection } from "typescript-toolkit/types";

type Test = IsAny<any>;
type Test = UnionToIntersection<{ foo: string; } | { bar: number; }>;
```

You can also import the namespace into your project:
```ts
// These imports are all equivalent
import { types } from "typescript-toolkit";
import types from "typescript-toolkit/types";
import * as types from "typescript-toolkit/types";

type Test = types.IsAny<any>;
type Test = types.UnionToIntersection<{ foo: string; } | { bar: number; }>;
```

For JavaScript projects, you can use a [`import()` types](https://www.typescriptlang.org/docs/handbook/modules/reference.html#import-types) or the [`@import` tag](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import) to import the namespace or individual types:
```js
/**
 * @typedef {import("typescript-toolkit/types").IsAny<any>} Test
 */
/**
 * @typedef {import("typescript-toolkit").types.UnionToIntersection<{ foo: string; } | { bar: number; }>} Test
 */

/**
 * @import IsAny from "typescript-toolkit/types/isAny"
 */
/**
 * @import {UnionToIntersection} from "typescript-toolkit/types"
 */
/**
 * @typedef {IsAny<any>} Test
 */
/**
 * @typedef {UnionToIntersection<{ foo: string; } | { bar: number; }>} Test
 */

/**
 * @import {types} from "typescript-toolkit"
 * @import types from "typescript-toolkit/types"
 */
/**
 * @typedef {types.IsAny<any>} Test
 */
/**
 * @typedef {types.UnionToIntersection<{ foo: string; } | { bar: number; }>} Test
 */
```


## Changelog
- [`1.0.0`](https://github.com/FusedKush/typescript-toolkit/releases/1.0.0):
  - Added `types`
  - Added [`isAny`](./isAny/)
  - Added [`unionToIntersection`](./unionToIntersection/)
