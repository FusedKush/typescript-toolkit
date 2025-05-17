# `types`
General-Purpose TypeScript Helper Types.


## Tool List
- [`baseTypes`](baseTypes): Types representing the _Base Types_ from which all types are derived.
- [`isAny`](isAny): Determine if the given type is `any`.
- [`unionToIntersection`](unionToIntersection): Transform the specified [union](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types) into an [intersection](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types).


## NPM Package Usage
You can directly import tools into your project:
```ts
// These imports are all equivalent
import IsAny from "typescript-toolkit/types/isAny";
import * as baseTypes from "typescript-toolkit/types/baseTypes";
import { UnionToIntersection } from "typescript-toolkit/types";

type IsAnyType = IsAny<any>;
type IntersectionObject = UnionToIntersection<{ foo: string; } | { bar: number; }>;
type BaseTypeStringUnion = baseTypes.BaseTypeString<"Hello, World!">;
```

You can also import the namespace into your project:
```ts
// These imports are all equivalent
import { types } from "typescript-toolkit";
import types from "typescript-toolkit/types";
import * as types from "typescript-toolkit/types";

type IsAnyType = types.IsAny<any>;
type IntersectionObject = types.UnionToIntersection<{ foo: string; } | { bar: number; }>;
type BaseTypeUnion = types.BaseType<"number" | "null">;
```

For JavaScript projects, you can use [`import()` types](https://www.typescriptlang.org/docs/handbook/modules/reference.html#import-types) or the [`@import` tag](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import) to virtually import the namespace or individual types:
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
  - Added `types`
  - Added [`isAny`](isAny)
  - Added [`unionToIntersection`](unionToIntersection)
  - Added [`baseTypes`](baseTypes)