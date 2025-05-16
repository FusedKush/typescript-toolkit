# `arrays/toListString`
Convert the specified array to a `string` containing a deliminator-separated list of the elements in the array.

```ts
toListString([])                                     // ""
toListString(["foo"])                                //  "foo"
toListString(["foo", "bar"])                         // "foo & bar"
toListString(["foo", "bar", "baz"]);                 // "foo, bar, & baz"

toListString(["foo", "bar", "baz"], " or ")          // "foo, bar, or baz"
toListString(["foo", "bar", "baz"], "")              // "foo, bar, baz"
toListString(["foo", "bar", "baz"], null, " - ");    // "foo - bar - baz"
toListString(["foo", "bar", "baz"], null, "/");      // "foobarbaz"
```


## Information
- **Author**: [Zach Vaughan (FusedKush)](https://github.com/FusedKush)
- **Depends On**: _None_
- **Dependents**: _None_


## NPM Package Usage
You can directly import the tool into your project:
```ts
// These imports are equivalent
import toListString from "typescript-toolkit/arrays/arrayify";
import { toListString } from "typescript-toolkit/arrays";

const listStr = toListString(["foo", "bar", "baz"]);
```

You can also import the enclosing namespace into your project:
```ts
// These imports are all equivalent
import { arrays } from "typescript-toolkit";
import arrays from "typescript-toolkit/arrays";
import * as arrays from "typescript-toolkit/arrays";

const listStr = arrays.toListString(["foo", "bar", "baz"]);
```


## Changelog
- [`1.0.0`](https://github.com/FusedKush/typescript-toolkit/releases/1.0.0): Added