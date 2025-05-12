# typescript-toolkit
A collection of various TypeScript tools, tricks, and utilities that can be used in a wide range of projects and programs.

The TypeScript Toolkit can be utilized in one of two ways:
1. As a [collection of TypeScript/JavaScript code snippets](#using-the-typescript-toolkit-as-a-collection-of-code-snippets).
2. As an [NPM Package](#using-the-typescript-toolkit-as-an-npm-package).

For an example of how the various *tools* in the toolkit are organized, see [`examples/exampleTool`](./toolkit/examples/exampleTool).


## Using the TypeScript Toolkit as a Collection of Code Snippets
The primary intention of the TypeScript Toolkit is to serve as a collection of versatile and high-quality TypeScript and JavaScript code snippets. Each *tool* in the toolkit, such as [`examples/exampleTool`](./toolkit/examples/exampleTool), is broken down into several files and folders, of which only two are relevant:
- `/ts/`, which contains the *TypeScript* code snippets.
- `/js/`, which contains the *JavaScript* code snippets.

The code snippet itself is then typically broken down into at least two different files, though more or fewer files may be provided:
- `index.ts` or `index.js`, which contains the standard code as it would be used along with any *dependencies*.
- `no-deps.ts` or `no-deps.js`, which contains the code **without** any (external) dependencies.

Each code snippet can be copied-and-pasted directly into the desired codebase. Ensure the documentation blocks and source information is copied as well, which will make it easier to check for future updates or report issues if necessary.


## Using the TypeScript Toolkit as an NPM Package
The TypeScript Toolkit can also be used as an [NPM Package](https://www.npmjs.com/package/typescript-toolkit). To install the package as a dependency of your project:
```
npm install typescript-toolkit
```

You can then import any of the tools in the toolkit just as you would any other NPM Package:
  ```ts
  // These imports are all equivalent
  import exampleTool from "typescript-toolkit/examples/exampleTool";
  import * as exampleTool from "typescript-toolkit/examples/exampleTool";
  import { exampleTool } from "typescript-toolkit/examples";

  console.log(exampleTool());
  ```

You can also import the enclosing namespace into your project:
```ts
// These imports are all equivalent
import { examples } from "typescript-toolkit";
import examples from "typescript-toolkit/examples";
import * as examples from "typescript-toolkit/examples";

console.log(examples.exampleTool());
```

> [!IMPORTANT]
> While simply adding the TypeScript Toolkit as a dependency of your project makes importing, updating, and working with the various tools in the toolkit effortless, it can also add considerable size and unnecessary bloat if only a couple of tools are being used and those tools are unlikely to be updated in the future.
> 
> Unless a large number of tools from the toolkit or up-to-date code snippets are required for your project, it is strongly recommended to just [use the toolkit as collection of TypeScript/JavaScript code snippets instead](#using-the-typescript-toolkit-as-a-collection-of-code-snippets).