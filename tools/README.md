# Tools
TypeScript Node Scripts used to automate and streamline various parts of the development, building, and deployment process.

To run these tools, run `node` with the `--experimental-transform-types` flag and pass it the path to the tool. E.g.,
```ps
node --experimental-transform-types tools/process-toolkit-schema.ts
```

> [!IMPORTANT]
> For these tools to work, you will need to have a version of `node` that is [`>= v22.7.0`](https://nodejs.org/en/learn/typescript/run-natively#running-typescript-code-with-nodejs).

> [!TIP]
> If you are using a Node Version Manager such as [nvs](https://github.com/jasongin/nvs) or [nvm](https://github.com/nvm-sh/nvm), you can use the `.node-version` file to download the appropriate version of `node`. E.g.,
>
> ```ps
> cd tools
> nvs use
> node --experimental-transform-types process-toolkit-schema.ts
> ```