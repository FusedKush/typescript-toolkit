# `types/unionToIntersection`
Transform the specified [union](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types) into an [intersection](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types).

```ts
interface Foo { foo: string; }
interface Bar { bar: number; }

type Foobar = Foo | Bar;
// { foo: string; } | { bar: number; }

type Test = UnionToIntersection<Foobar>;
// { foo: string; bar: number; }
```


## Information
- **Author**: [Zach Vaughan (FusedKush)](https://github.com/FusedKush)
- **Original Source**: [_Stack Overflow_](https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type#answer-50375286)
- **Depends On**: _None_
- **Dependents**: _None_


## NPM Package Usage
You can directly import the tool into your project:
```ts
// These imports are all equivalent
import UnionToIntersection from "typescript-toolkit/types/unionToIntersection";
import * as UnionToIntersection from "typescript-toolkit/types/unionToIntersection";
import { UnionToIntersection } from "typescript-toolkit/types";

type Test = UnionToIntersection<{ foo: string; } | { bar: number; }>;
```

You can also import the enclosing namespace into your project:
```ts
// These imports are all equivalent
import { types } from "typescript-toolkit";
import types from "typescript-toolkit/types";
import * as types from "typescript-toolkit/types";

type Test = UnionToIntersection<{ foo: string; } | { bar: number; }>;
```

For JavaScript projects, you can use a [Dynamic Import Expression](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-4.html#dynamic-import-expressions) to import the type:
```js
/**
 * @typedef {import("typescript-toolkit/types").UnionToIntersection<{ foo: string; } | { bar: number; }>} Test
 */
```


## Changelog
- [`1.0.0`](https://github.com/FusedKush/typescript-toolkit/releases/1.0.0): Added