# `examples`
Example tools.


## NPM Package Usage
You can directly import tools into your project:
```ts
// These imports are all equivalent
import exampleTool from "typescript-toolkit/examples/exampleTool";
import * as exampleTool from "typescript-toolkit/examples/exampleTool";
import { exampleTool } from "typescript-toolkit/examples";

console.log(exampleTool());
```

You can also import the namespace into your project:
```ts
// These imports are all equivalent
import { examples } from "typescript-toolkit";
import examples from "typescript-toolkit/examples";
import * as examples from "typescript-toolkit/examples";

console.log(examples.exampleTool());
```


## Changelog
- [`0.0.1`](https://github.com/FusedKush/typescript-toolkit): Added