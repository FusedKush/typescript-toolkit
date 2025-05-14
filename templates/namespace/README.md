# `NAMESPACE`
Namespace description goes here...


## Tool List
- [`example`](./example/)


## NPM Package Usage
You can directly import tools into your project:
```ts
// These imports are all equivalent
import Example from "typescript-toolkit/NAMESPACE/example";
import * as Example from "typescript-toolkit/NAMESPACE/example";
import { Example } from "typescript-toolkit/NAMESPACE";

type Test = Example<true>;
```

You can also import the namespace into your project:
```ts
// These imports are all equivalent
import { NAMESPACE } from "typescript-toolkit";
import NAMESPACE from "typescript-toolkit/NAMESPACE";
import * as NAMESPACE from "typescript-toolkit/NAMESPACE";

type Test = NAMESPACE.Example<true>;
```

For JavaScript projects, you can use [`import()` types](https://www.typescriptlang.org/docs/handbook/modules/reference.html#import-types) or the [`@import` tag](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import) to import the namespace or individual types:
```js
/**
 * @typedef {import("typescript-toolkit/NAMESPACE").Example<true>} Test
 */
/**
 * @typedef {import("typescript-toolkit").NAMESPACE.Example<true>} Test
 */

/**
 * @import Example from "typescript-toolkit/NAMESPACE/example"
 * @import { Example } from "typescript-toolkit/NAMESPACE"
 */
/**
 * @typedef {Example<true>} Test
 */

/**
 * @import { NAMESPACE } from "typescript-toolkit"
 * @import NAMESPACE from "typescript-toolkit/NAMESPACE"
 */
/**
 * @typedef {NAMESPACE.Example<true>} Test
 */
```


## Changelog
- [`TARGET_VERSION`](https://github.com/FusedKush/typescript-toolkit/releases/TARGET_VERSION):
  - Added `NAMESPACE`
  - Added [`example`](./example/)
