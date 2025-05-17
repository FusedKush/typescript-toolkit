<div align="center">
    <h1>TypeScript Toolkit</h1>
    <p style="font-size: 1.25em;"><b><i>A collection of various TypeScript tools, tricks, and utilities that can be used in a wide range of projects and programs.</i></b></p>
    <div style="font-size: 1.15em; margin-bottom: 0.5em;">
      <b>
        <a href="https://github.com/FusedKush/typescript-toolkit">Project Repository</a>
        &bull; <a href="https://www.npmjs.com/package/typescript-toolkit">NPM Package</a>
        &bull; <a href="https://github.com/FusedKush/typescript-toolkit/wiki">API Documentation</a>
      </b>
    </div>
    <div>
      <i>
        <a href="CONTRIBUTING.md#reporting-issues">Report an Issue</a>
        &bull; <a href="CONTRIBUTING.md#making-a-feature-request-or-improvement-suggestion">Make a Suggestion</a>
        &bull; <a href="CONTRIBUTING.md#contributing-to-the-typescript-toolkit">Contribute</a>
        &bull; <a href="LICENSE">License</a>
        &bull; <a href="SECURITY.md">Security Policy</a>
      </i>
    </div>
</div>


## Using the TypeScript Toolkit
The TypeScript Toolkit can be used in two different ways:
1. As a [collection of TypeScript/JavaScript code snippets](#as-a-collection-of-code-snippets).
2. As an [NPM Package](#as-an-npm-package).


### ...as a Collection of Code Snippets
The primary intention of the TypeScript Toolkit is to serve as a collection of versatile and high-quality TypeScript and JavaScript code snippets. Each *tool* in the toolkit, such as `arrays/arrayify` or `types/baseTypes`, contains two relevant folders:
- `/ts/`, which contains the *TypeScript* code snippets.
- `/js/`, which contains the *JavaScript* code snippets.

The code snippets themselves are then typically broken down into two or more files, including, but not limited to:
- `index.ts` or `index.js`, which contains the standard code as it would be used along with any *dependencies*.
- `no-deps.ts` or `no-deps.js`, which contains the code **without** any (external) dependencies.

Each code snippet can be copied-and-pasted directly into the desired codebase. Ensure the documentation blocks and source information is copied as well, which will make it easier to check for future updates or report issues if necessary.


### ...as an NPM Package
The TypeScript Toolkit can also be used as an [NPM Package](https://www.npmjs.com/package/typescript-toolkit). Each *tool* in the toolkit, such as `arrays/arrayify` or `types/baseTypes`, contains two relevant files and folders:
- `/module/`, which contains the TypeScript module code.
- `/index.ts`, which simply re-exports the contents of `/module/index.ts`.


To install the package as a dependency of your project:
```
npm install typescript-toolkit
```

You can then import any of the tools in the toolkit just as you would any other NPM Package:
```ts
// These imports are all equivalent
import arrayify from "typescript-toolkit/arrays/arrayify";
import { UnionToIntersection } from "typescript-toolkit/types/unionToIntersection";
import { IsAny } from "typescript-toolkit/types";

type IsAnyType = IsAny<any>;
type IntersectionObject = UnionToIntersection<{ foo: string; } | { bar: number; }>;
const arrayifiedFoobar = arrayify("foobar");
```

You can also import the namespaces themselves into your project:
```ts
// These imports are all equivalent
import { arrays, types } from "typescript-toolkit";
import arrays from "typescript-toolkit/arrays";
import * as types from "typescript-toolkit/types";

type IsAnyType = types.IsAny<any>;
type IntersectionObject = types.UnionToIntersection<{ foo: string; } | { bar: number; }>;
const arrayifiedFoobar = arrays.arrayify("foobar");
```

For JavaScript projects, you can use [`import()` types](https://www.typescriptlang.org/docs/handbook/modules/reference.html#import-types) or [`@import` tags](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import) to virtually import type-based tools and namespaces:
```js
/**
 * @typedef {import("typescript-toolkit/types").IsAny<any>} IsAnyType
 */
/**
 * @typedef {import("typescript-toolkit").arrays.ArrayifyType<"foobar">} ArrayifiedFoobar
 */

/**
 * @import UnionToIntersection from "typescript-toolkit/types/unionToIntersection"
 * @import { ArrayifyType } from "typescript-toolkit/arrays"
 */
/**
 * @typedef {UnionToIntersection<{ foo: string; } | { bar: number; }>} IntersectionObject
 */
/**
 * @typedef {ArrayifyType<"foobar">} ArrayifiedFoobar
 */

/**
 * @import arrays from "typescript-toolkit/arrays"
 * @import * as types from "typescript-toolkit/types"
 * @import { arrays, types } from "typescript-toolkit"
 */
/**
 * @typedef {types.IsAny<any>} IsAnyType
 */
/**
 * @typedef {arrays.ArrayifyType<"foobar">} ArrayifiedFoobar
 */
```

> [!IMPORTANT]
> While simply adding the TypeScript Toolkit as a dependency of your project makes importing, updating, and working with the various tools in the toolkit effortless, it can also add considerable size and unnecessary bloat if only a couple of tools are being used and those tools are unlikely to be updated in the future.
> 
> Unless a large number of tools from the toolkit or up-to-date code snippets are required for your project, it is strongly recommended to just [use the toolkit as collection of TypeScript/JavaScript code snippets instead](#as-a-collection-of-code-snippets).


## More Information
More information about the individual namespaces and tools in the TypeScript Toolkit can be found in their respective `README.md` files.

API Documentation for the TypeScript Toolkit is available on the [Repository Wiki](https://github.com/FusedKush/typescript-toolkit/wiki).

For licensing information, see [`LICENSE`](LICENSE).

For information about filing issues, submitting suggestions, and reporting security vulnerabilities, see [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`SECURITY.md`](SECURITY.md).

For information about contributing to the TypeScript Toolkit Project, see [`CONTRIBUTING.md`](CONTRIBUTING.md#contributing-to-the-typescript-toolkit);
