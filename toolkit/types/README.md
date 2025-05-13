# `types`
General-Purpose TypeScript Helper Types.


## Tool List
- [`isAny`](./isAny/)


## NPM Package Usage
You can directly import tools into your project:
```ts
// These imports are all equivalent
import IsAny from "typescript-toolkit/types/isAny";
import * as IsAny from "typescript-toolkit/types/isAny";
import { IsAny } from "typescript-toolkit/types";

type Test = IsAny<any>;
```

You can also import the namespace into your project:
```ts
// These imports are all equivalent
import { types } from "typescript-toolkit";
import types from "typescript-toolkit/types";
import * as types from "typescript-toolkit/types";

type Test = types.IsAny<any>;
```


## Changelog
- [`1.0.0`](https://github.com/FusedKush/typescript-toolkit/releases/1.0.0):
  - Added `types`
  - Added [`isAny`](./isAny/)
