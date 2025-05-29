# Tools
TypeScript Node Scripts used to automate and streamline various parts of the development, building, and deployment process.

- [`process-toolkit-schema`](#process-toolkit-schema): A helper script used to validate and update various project and toolkit files based on the Toolkit Schema ([`toolkit/schema.json`](../toolkit/schema.json)).
- [`add-namespace`](#add-namespace): A helper script used to add a new Namespace to the TypeScript Toolkit.

<br>

To use these tools, run `node` with the `--experimental-transform-types` flag and pass it the path to the tool. E.g.,
```bash
node --experimental-transform-types add-namespace.ts -n test -d "A Test Namespace."
```

> [!IMPORTANT]
> For these tools to work, you will need to have a version of `node` that is [`>= v22.7.0`](https://nodejs.org/en/learn/typescript/run-natively#running-typescript-code-with-nodejs).

> [!TIP]
> If you are using a Node Version Manager such as [nvs](https://github.com/jasongin/nvs) or [nvm](https://github.com/nvm-sh/nvm), you can use the `.node-version` file to download the appropriate version of `node`. E.g.,
>
> ```bash
> cd tools
> nvs use
> node --experimental-transform-types process-toolkit-schema.ts
> ```

<br>

## [`process-toolkit-schema`](process-toolkit-schema.ts)
A helper script used to validate and update various project and toolkit files based on the Toolkit Schema ([`toolkit/schema.json`](../toolkit/schema.json)).

```console
process-toolkit-schema  [/? | --usage | --help]
                        [--dry-run]
                        [[-v | --verify-schema] | [-V | --skip-schema-verification]]
                        [[-e | --update-package-exports] | [-E | --skip-package-exports]]
                        [[-i | --update-issue-templates] | [-I | --skip-issue-templates]]
                        [[-r | --update-readme-files] | [-R | --skip-readme-files]]
                        [[-d | --update-dependency-imports] | [-D | --skip-dependency-imports]]
```


### Options
#### `[/? | --usage | --help]`
Print the usage message.


#### `[--dry-run]`
Print what changes would have been made instead of actually making them.


#### `[[-v | --verify-schema] | [-V | --skip-schema-verification]]`
Verify or skip verifying the [Toolkit Schema](../toolkit/schema.json).


#### `[[-e | --update-package-exports] | [-E | --skip-package-exports]]`
Update or skip updating the [`package.json`](../package.json) file.


#### `[[-i | --update-issue-templates] | [-I | --skip-issue-templates]]`
Update or skip updating the [GitHub Issue Templates](../.github/ISSUE_TEMPLATE).


#### `[[-r | --update-readme-files] | [-R | --skip-readme-files]]`
Update or skip updating the Toolkit, Namespace, and Tool `README.md` Files.


#### `[[-d | --update-dependency-imports] | [-D | --skip-dependency-imports]]`
Update or skip updating the Toolkit Dependency Imports.

<br>

## [`add-namespace`](add-namespace.ts)
A helper script used to add a new Namespace to the TypeScript Toolkit.

```console
add-namespace   [/? | --usage | --help]
                [--dry-run]
                [<-n | --namespace> <Namespace>]
                [<-d | --description> <Description>]
                [<-m | --markdown-description> <Markdown Description>]
```

As long as the [`--dry-run`](#--dry-run-1) option is not used, the [`process-toolkit-schema`](#process-toolkit-schema) tool will automatically be run with the `--skip-dependency-imports` option after the new namespace has been added to the [TypeScript Toolkit Schema](../toolkit/schema.json).


### Options
#### `[/? | --usage | --help]`
Print the usage message.


#### `[--dry-run]`
Print what changes would have been made instead of actually making them.


#### `[<-n | --namespace> <Namespace>]`
Specifies the name of the new namespace.

When specified, the script will **not** prompt the user for any input, requiring the command-line options to be used to specify the [description](#-d----description-description) and [markdown description](#-m----markdown-description-markdown-description), if desired.


#### `[<-d | --description> <Description>]`
Specifies the description of the new namespace.


#### `[<-m | --markdown-description> <Markdown Description>]`
Specifies the markdown description of the new namespace.