/**
 * Utilities for the automation scripts in the `/tools` directory.
 * 
 * @author Zach Vaughan (FusedKush)
 */
declare module "./utils.ts";

import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import Path from "node:path";


/**
 * An enumeration type comprised of the different types that
 * a given Toolkit Export can be of.
 */
export enum ToolkitExportType {

    /**
     * A custom *Type Definition*.
     * 
     * In *TypeScript Files*, these are denoted by
     * the `type` keyword, while in *JavaScript Files*, they
     * are instead denoted by the `@typedef` tag.
     * 
     * @example
     * ```ts
     * type TheAnswer = 42;
     * ```
     */
    TYPE = 'type',
    /**
     * An *Interface Definition*.
     * 
     * In *TypeScript Files*, these are denoted by
     * the `interface` or `type` keywords, while in *JavaScript* Files,
     * they are instead denoted by the `@interface` or `@typedef` tags.
     * 
     * @example
     * ```ts
     * interface MyInterface {
     *    isTheAnswer ( x: string | number ): boolean;
     * }
     * ```
     * 
     * @see {@link TYPE}
     * @see {@link CLASS}
     */
    INTERFACE = 'interface',
    /**
     * A custom class definition.
     * 
     * Classes are denoted by the `class` keyword.
     * 
     * @example
     * ```ts
     * class MyClass {
     *    constructor ();
     *    isTheAnswer ( x: string | number ): boolean;
     * }
     * ```
     * 
     * @see {@link INTERFACE}
     */
    CLASS = 'class',
    /**
     * A custom function.
     * 
     * Functions may be denoted by the `function` keyword:
     * ```ts
     * function isTheAnswer ( x: string | number ): boolean {
     *    return (x == 42);
     * }
     * ```
     * 
     * or assigned to *constants* and *variables* using
     * [Arrow Functions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/Arrow_functions):
     * ```ts
     * const isTheAnswer = ( x: string | number ): boolean => (x == 42);
     * ```
     */
    FUNCTION = 'function',
    /**
     * A constant value or expression.
     * 
     * Constants are denoted by the `const` keyword.
     * 
     * @example
     * ```ts
     * const THE_ANSWER = 42;
     * ```
     * 
     * @see {@link VARIABLE}
     */
    CONSTANT = 'constant',
    /**
     * A variable value.
     * 
     * Variables can be denoted by the `const`, `var`, or `let` keywords.
     * 
     * @example
     * ```ts
     * var theAnswer: number = 42;
     * ```
     * 
     * @see {@link CONSTANT}
     */
    VARIABLE = 'variable',
    /**
     * A global member and/or change to the global namespace.
     * 
     * Global exports **cannot** be *imported* as Toolkit Dependencies,
     * as they are instead expected to modify the global namespace in
     * some way (e.g., modifying `window` or `String`).
     */
    GLOBAL = 'global'

};

/**
 * An interface representing the *TypeScript Toolkit Schema*
 * (`/toolkit/schema.json`) defining the available
 * Toolkit Namespaces, Tools, and Exports.
 */
export interface ToolkitSchema {

    /** A Namespace in the TypeScript Toolkit. */
    [Namespace: string]: {

        /**
         * A short description of the Toolkit Namespace.
         */
        description?: string;
        /**
         * A short description of the Toolkit Namespace that supports Markdown.
         * 
         * If omitted, the `description` will be used instead.
         */
        markdownDescription?: string;
        /**
         * The Tools in this Toolkit Namespace.
         */
        tools: {

            /** A Tool in the TypeScript Toolkit. */
            [Tool: string]: {

                /**
                 * A short description of the Toolkit Tool.
                 */
                description?: string;
                /**
                 * A short description of the Toolkit Tool that supports Markdown.
                 * 
                 * If omitted, the `description` will be used instead.
                 */
                markdownDescription?: string;
                /**
                 * The TypeScript/JavaScript Members exported by this Toolkit Tool.
                 */
                exports: {

                    /**
                     * A TypeScript/JavaScript Member exported
                     * by a Tool in the TypeScript Toolkit.
                     */
                    [Export: string]: {

                        /**
                         * The {@link ToolkitExportType type} of the exported member.
                         */
                        type: ToolkitExportType;
                        /**
                         * A short description of the Exported TypeScript/JavaScript Member.
                         */
                        description?: string;
                        /**
                         * A short description of the Exported TypeScript/JavaScript Member that supports Markdown.
                         * 
                         * If omitted, the `description` will be used instead.
                         */
                        markdownDescription?: string;

                    }

                },
                /**
                 * Any Dependencies on other Tools in the TypeScript Toolkit.
                 */
                dependencies?: string[]
            
            }

        }

    }

}

/**
 * Retrieve the {@link ToolkitSchema} from the
 * TypeScript Toolkit Schema (`/toolkit/schema.json`).
 * 
 * Note that any keys starting with a `$` character in
 * the Toolkit Schema will be automatically omitted
 * from the returned object.
 * 
 * @returns     The {@link Parsed Toolkit Schema}.
 * 
 * @throws      An {@link Error} if the Toolkit Schema could
 *              not be successfully retrieved or parsed.
 */
export function fetchToolkitSchema (): ToolkitSchema {

    try {
        let schema = readJsonFile(`${TOOLKIT_PATH}/schema.json`);
        let keys = Object.keys(schema);
        
        // Remove any property with a key that starts with a `$` character.
        keys.forEach((key) => {

            if (key.startsWith('$'))
                delete schema[key];

        });

        return schema;
    }
    catch (error) {
        throw new Error(
            `Failed to retrieve the TypeScript Toolkit Schema: ${(error as Error).message}`,
            { cause: error }
        );
    }

}
export function updateToolkitSchema ( schema: ToolkitSchema, dryRun: boolean = false ): void {

    writeFile(`${TOOLKIT_PATH}/schema.json`, stringifyJson(schema), dryRun);

    if (!dryRun)
        console.log("Successfully updated the TypeScript Toolkit Schema.");

}

/**
 * Indent every line of the designated `output`.
 * 
 * @param output    The console output `string` being indented.
 * 
 * @returns         A `string` containing the indented `output`.
 */
export const indentOutput = ( output: string ): string => output.replaceAll(/^/gm, '\t');
/**
 * Make the specified `path` pretty
 * and relative to the Project Root.
 * 
 * @param path  The path being prettified.
 * 
 * @returns     The pretty `path`.
 */
export const prettyPath = ( path: string ): string => Path.relative("../", Path.resolve(path));


// Serialization and File Management

/**
 * A helper function to synchronously get the contents
 * of a file as a UTF-8-Encoded `string`.
 * 
 * @param filePath  The path to the file being read.
 * 
 * @returns         A `string` containing the contents of the file.
 */
export const readFile = ( filepath: string ): string => readFileSync(filepath, { encoding: 'utf-8' });
export const writeFile = ( filepath: string, contents: string, dryRun: boolean = false ) => {

    var tempFileDir: string = mkdtempSync(Path.join(tmpdir(), 'typescript-toolkit-'));

    if (!dryRun) {
        try {
            const tempfileName = `${tempFileDir}${Path.sep}${Path.basename(filepath)}`;
    
            // Write the contents to a temporary file before
            // replacing the existing file with the new one.
            writeFileSync(tempfileName, contents, { encoding: 'utf-8' });
            copyFileSync(tempfileName, filepath);
            rmSync(tempfileName);
            console.log(`Successfully updated file ${prettyPath(filepath)}.`);
        }
        catch (error) {
            throw new Error(
                `Failed to commit changes to file ${prettyPath(filepath)}: ${(error as Error).message}`,
                { cause: error }
            );
        }
    }
    else {
        console.log(`\nChanges to be made to file ${prettyPath(filepath)}:`);
        console.log(indentOutput(contents));
    }

};

/**
 * A helper function to synchronously retrieve 
 * and parse the contents of a `JSON` File.
 * 
 * @template T      The type of the parsed data returned by the function.
 * 
 * @param filePath  The path to the `JSON` File being read.
 * 
 * @returns         The parsed contents of the specified `JSON` File.
 * 
 * @throws          A {@link SyntaxError} if the contents of the specified file
 *                  does not form a valid JSON `string`.
 */
export const readJsonFile = <T extends Record<string, any>> ( filePath: string ): T => JSON.parse(readFile(filePath));

/**
 * A helper function to `string`-ify the designated JSON `data`.
 * 
 * @param data  The `JSON` data being `string`-ified.
 * 
 * @returns     A valid JSON `string` terminated by a newline (`/n`).
 */
export const stringifyJson = ( data: Record<string, any> ): string => `${JSON.stringify(data, null, 2)}\n`;


/**
 * The path to the root of the project.
 */
export const ROOT_PATH = "../";
/**
 * The path to the `/toolkit` Directory containing
 * the main TypeScript Toolkit Codebase.
 */
export const TOOLKIT_PATH = `${ROOT_PATH}/toolkit`;