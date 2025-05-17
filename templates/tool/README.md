# `NAMESPACE/TOOL_NAME`
Description of the tool goes here...

```ts
// Example of using the tool goes here...
```


## Information
- **Author**: [AUTHOR_NAME](AUTHOR_LINK)
- **Original Source**: [_SOURCE NAME_](SOURCE_URL)
- **Depends On**: _None_
  - [`DEPENDENCY_NAME`](PATH_TO_DEPENDENCY)
- **Dependents**: _None_
  - [`DEPENDENT_NAME`](PATH_TO_DEPENDENT)


## NPM Package Usage
You can directly import the tool into your project:
```ts
// These imports are all equivalent
import TOOL_NAME from "typescript-toolkit/NAMESPACE/TOOL_NAME";
import { TOOL_NAME } from "typescript-toolkit/NAMESPACE/TOOL_NAME";
import { TOOL_NAME } from "typescript-toolkit/NAMESPACE";

// Quick example of using the tool goes here...
// TOOL_NAME
```

You can also import the enclosing namespace into your project:
```ts
// These imports are all equivalent
import { NAMESPACE } from "typescript-toolkit";
import NAMESPACE from "typescript-toolkit/NAMESPACE";
import * as NAMESPACE from "typescript-toolkit/NAMESPACE";

// Quick example of using the tool goes here...
// NAMESPACE.TOOL_NAME
```

For JavaScript projects, you can use [`import()` types](https://www.typescriptlang.org/docs/handbook/modules/reference.html#import-types) or the [`@import` tag](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import) to virtually import the namespace or individual types:
```js
/**
 * @typedef {import("typescript-toolkit/NAMESPACE").TOOL_NAME} Test
 */
/**
 * @typedef {import("typescript-toolkit").NAMESPACE.TOOL_NAME} Test
 */

/**
 * @import TOOL_NAME from "typescript-toolkit/NAMESPACE/TOOL_NAME"
 * @import { TOOL_NAME } from "typescript-toolkit/NAMESPACE"
 */
/**
 * @typedef {TOOL_NAME} Test
 */

/**
 * @import { NAMESPACE } from "typescript-toolkit"
 * @import NAMESPACE from "typescript-toolkit/NAMESPACE"
 */
/**
 * @typedef {NAMESPACE.TOOL_NAME} Test
 */
```


## Changelog
- [`TARGET_VERSION`](https://github.com/FusedKush/typescript-toolkit/releases/TARGET_VERSION): Added