# `types/baseTypes`
Types representing the _Base Types_ from which all types are derived.

These _Base Types_ are a **superset** of the types recognized by the [`typeof` operator](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/typeof).

```ts
// Types //

type BaseTypeUnion = BaseType;
// string | number | bigint | boolean | symbol | object | any[] | ((...args: any[]) => any) | null | undefined

type BaseTypeStringUnion = BaseTypeString;
// "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "null" | "array"

type CustomBaseTypeUnion = BaseType<"string" | "array" | "null">;
// string | any[] | null

type CustomBaseTypeStringUnion = BaseTypeString<"Hello, World!" | [42] | null>;
// "string" | "array" | "null"

type NestedBaseTypeUnion = BaseType<BaseTypeString<"Hello, World!">>;
// string

type NestedBaseTypeStringUnion = BaseTypeString<BaseType<"function">>;
// ( ...args: any[] ) => any;


// Functions //

var baseTypeValue = getBaseType(["foo", "bar", "baz"]);
// "array"

if (isBaseType(someUnknownValue, ["string", "number", "boolean"])) {
   console.log(`The Unknown Value: ${someUnknownValue}`);
}

assertBaseType([42], ["object", "function"]);
// throws: TypeError("The specified value is not of any of the following types: object or function (A array was provided).");
```


## Information
- **Author**: [Zach Vaughan (FusedKush)](https://github.com/FusedKush)
- **Depends On**:
  - [`arrays/arrayify`](../../arrays/arrayify)
  - [`arrays/toListString`](../../arrays/toListString)
- **Dependents**: _None_


## NPM Package Usage
You can directly import the tool into your project:
```ts
// These imports are all equivalent
import baseTypes from "typescript-toolkit/types/baseTypes";
import * as baseTypes from "typescript-toolkit/types/baseTypes";
import { BaseType, BaseTypeString, getBaseType } from "typescript-toolkit/types";

type BaseTypeUnion = BaseType;
type BaseTypeStringUnion = baseTypes.BaseTypeString;
var baseTypeValue = getBaseType(["foo", "bar", "baz"]);
```

You can also import the enclosing namespace into your project:
```ts
// These imports are all equivalent
import { types } from "typescript-toolkit";
import types from "typescript-toolkit/types";
import * as types from "typescript-toolkit/types";

type CustomBaseTypeUnion = types.BaseType<"string" | "number">;
type CustomBaseTypeStringUnion = types.BaseTypeString<[42] | null>;
var baseTypeValue = types.getBaseType(["foo", "bar", "baz"]);
```

For JavaScript projects, you can use [`import()` types](https://www.typescriptlang.org/docs/handbook/modules/reference.html#import-types) or the [`@import` tag](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import) to virtually import individual types or the parent namespace:
```js
/**
 * @typedef {import("typescript-toolkit/types").BaseType} BaseTypeUnion
 */
/**
 * @typedef {import("typescript-toolkit").types.BaseTypeString} BaseTypeStringUnion
 */

/**
 * @import baseTypes from "typescript-toolkit/types/baseTypes"
 * @import { BaseType, BaseTypeString } from "typescript-toolkit/types"
 */
/**
 * @typedef {baseTypes.BaseType} BaseTypeUnion
 */
/**
 * @typedef {BaseTypeString} BaseTypeStringUnion
 */

/**
 * @import * as types from "typescript-toolkit/types"
 * @import { types } from "typescript-toolkit"
 */
/**
 * @typedef {types.BaseType<"string" | "number">} CustomBaseTypeUnion
 */
/**
 * @typedef {types.BaseTypeString<[42] | null>} CustomBaseTypeStringUnion
 */
```


## Changelog
- [`1.0.0`](https://github.com/FusedKush/typescript-toolkit/releases/1.0.0): Added