# `types/isAny`
Determine if the given type is `any`.

```ts
type Test = IsAny<any>;      // true
type Test = IsAny<unknown>;  // false
type Test = IsAny<never>;    // false
type Test = IsAny<42>;       // false
```


## Information
- **Author**: [Zach Vaughan (FusedKush)](https://github.com/FusedKush)
- **Original Source**: [_Stack Overflow_](https://stackoverflow.com/questions/55541275/typescript-check-for-the-any-type#answer-77451367)
- **Depends On**: _None_
- **Dependents**: _None_


## NPM Package Usage
You can directly import the tool into your project:
```ts
// These imports are all equivalent
import IsAny from "typescript-toolkit/types/isAny";
import * as IsAny from "typescript-toolkit/types/isAny";
import { IsAny } from "typescript-toolkit/types";

type Test = IsAny<any>;
```

You can also import the enclosing namespace into your project:
```ts
// These imports are all equivalent
import { types } from "typescript-toolkit";
import types from "typescript-toolkit/types";
import * as types from "typescript-toolkit/types";

type Test = types.IsAny<any>;
```

For JavaScript projects, you can use [`import()` types](https://www.typescriptlang.org/docs/handbook/modules/reference.html#import-types) or the [`@import` tag](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import) to import the type:
```js
/**
 * @typedef {import("typescript-toolkit/types").IsAny<any>} Test
 */
/**
 * @typedef {import("typescript-toolkit").types.IsAny<any>} Test
 */

/**
 * @import IsAny from "typescript-toolkit/types/isAny"
 */
/**
 * @import {IsAny} from "typescript-toolkit/types"
 */
/**
 * @typedef {IsAny<any>} Test
 */

/**
 * @import {types} from "typescript-toolkit"
 * @import types from "typescript-toolkit/types"
 */
/**
 * @typedef {types.IsAny<any>} Test
 */
```


## Changelog
- [`1.0.0`](https://github.com/FusedKush/typescript-toolkit/releases/1.0.0): Added