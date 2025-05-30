/**
 * Utilities for the automation scripts in the `/tools` directory.
 * 
 * @author Zach Vaughan (FusedKush)
 */
declare module "./utils.ts";

import {
    copyFileSync,
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmdirSync,
    rmSync,
    writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import Path from "node:path";


/* Exported Types & Interfaces */

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
        tools?: {

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
 * A partial interface containing the relevant
 * fields of the parsed `package.json` NPM Configuration File.
 */
export interface PackageConfig {

    /**
     * The current version of the NPM Package.
     * 
     * > Version must be parsable by `node-semver`, which is bundled with `npm` as a dependency.
     */
    version: string;
    /**
     * Defines the mappings that can be used to import the package.
     * 
     * > The `exports` field is used to restrict external access to non-exported module files,
     *   also enables a module to import itself using "name".
     */
    exports: {

        /** The mapping for the entire package itself. */
        ".": "./dist/index.js";
        /** Mappings for Toolkit Namespaces and Tools. */
        [x: string]: string;

    };
    /**
     * Represents all of the other fields in the configuration file.
     */
    [x: string]: any;

}

/**
 * An interface defining the options that can
 * be passed to the {@link writeFile `writeFile()`} function.
 * 
 * @see {@link writeFile `writeFile()`}
 */
export interface WriteFileOptions {

    /**
     * Indicates whether or not to print to the console
     * what changes would have been made to the
     * file instead of actually making them.
     */
    dryRun?: boolean;
    /**
     * The prefix of the randomly-generated temporary directory.
     * 
     * When specified, the temporary directory will
     * have a path of the following format:
     * `$TEMP/typescript-toolkit/$PREFIX-$RANDOM`
     * where `$TEMP` is the {@link tmpdir operating system's default directory for temporary files},
     * `$PREFIX` is the `tempDirPrefix`, and `$RANDOM` corresponds to the
     * randomly-generated characters appended to the end of the directory name.
     * 
     * When omitted, the temporary directory will
     * instead have a path of the following format:
     * `$TEMP/typescript-toolkit/$RANDOM` where `$TEMP` is
     * the {@link tmpdir operating system's default directory for temporary files}
     * and `$RANDOM` corresponds to the randomly-generated characters appended
     * to the end of the directory name.
     */
    tempDirPrefix?: string;

}


/* Internal Global Variables */

/**
 * A map of {@link WriteFileOptions.tempDirPrefix Temporary Directory Prefixes}
 * to the {@link mkdtempSync Randomly-Generated Temporary Directory Name}.
 * 
 * This variable is primarily used by the {@link writeFile `writeFile()`}
 * function to re-use temporary directories for multiple files being
 * modified by the same script.
 * 
 * @see {@link writeFile `writeFile()`}
 */
var tempDirs: Record<string, string> = {};


/* Exported Functions */
// Toolkit Schema Management

/**
 * Retrieve the {@link ToolkitSchema} from the
 * TypeScript Toolkit Schema (`/toolkit/schema.json`).
 * 
 * Any keys starting with a `$` character in the
 * Toolkit Schema object will be automatically omitted
 * from the returned object.
 * 
 * @returns     The {@link Parsed Toolkit Schema}.
 * 
 * @throws      An {@link Error} if the Toolkit Schema could
 *              not be successfully retrieved or parsed.
 * 
 * @see         {@link updateToolkitSchema `updateToolkitSchema()`}
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
/**
 * Update the TypeScript Toolkit Schema to reflect
 * the specified {@link ToolkitSchema} object.
 * 
 * @param schema            The {@link ToolkitSchema} representing the
 *                          Modified Toolkit Schema.
 * 
 * @param dryRun            Indicates whether or not to print to the console
 *                          what changes would have been made to the various
 *                          files instead of actually making them.
 * 
 * @param tempDirPrefix     The {@link WriteFileOptions.tempDirPrefix Temporary Directory Prefix}
 *                          for {@link writeFile `writeFile()`} to use.
 * 
 * @throws                  An {@link Error} if the Toolkit Schema could
 *                          not be successfully updated.
 * 
 * @see                     {@link fetchToolkitSchema `fetchToolkitSchema()`}
 * @see                     {@link stringifyJson `stringifyJson()`}
 * @see                     {@link writeFile `writeFile()`}
 */
export function updateToolkitSchema (
    schema: ToolkitSchema,
    dryRun: boolean = false,
    tempDirPrefix?: string
): void {

    try {
        writeFile(`${TOOLKIT_PATH}/schema.json`, stringifyJson(schema), { dryRun, tempDirPrefix: tempDirPrefix });
    
        if (!dryRun)
            console.log("Successfully updated the TypeScript Toolkit Schema.");
    }
    catch (error) {
        throw new Error(
            `Failed to update the TypeScript Toolkit Schema: ${(error as Error).message}`,
            { cause: error }
        );
    }

}


// Program Output Formatting

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
 * @param filepath  The path to the file being read.
 * 
 * @returns         A `string` containing the contents of the file.
 * 
 * @see             {@link writeFile `writeFile()`}
 */
export const readFile = ( filepath: string ): string => readFileSync(filepath, { encoding: 'utf-8' });

/**
 * A helper function to synchronously write the
 * provided `contents` to the file specified by the `filepath`.
 * 
 * The specified `contents` will first be written to a temporary
 * file before copying and overriding the file specified
 * `filepath` with the contents of the temporary file.
 * 
 * @param filepath  The path to the file being written to.
 * 
 * @param contents  The contents to be written to the specified file.
 * 
 * @param options   An {@link WriteFileOptions object}
 *                  containing the options to use when writing the file.
 * 
 * @throws          An {@link Error} if the designated file was not
 *                  successfully updated with the specified `contents`.
 */
export function writeFile ( filepath: string, contents: string, options?: WriteFileOptions ): void;
/**
 * A helper function to synchronously write the
 * provided `contents` to the file specified by the `filepath`.
 * 
 * The specified `contents` will first be written to a temporary
 * file before copying and overriding the file specified
 * `filepath` with the contents of the temporary file.
 * 
 * @param filepath          The path to the file being written to.
 * 
 * @param contents          The contents to be written to the specified file.
 * 
 * @param dryRun            Indicates whether or not to print to the console
 *                          what changes would have been made to the
 *                          file instead of actually making them.
 * 
 * @param tempDirSuffix     The prefix of the randomly-generated temporary directory.
 *                          
 *                          When specified, the temporary directory will
 *                          have a path of the following format:
 *                          `$TEMP/typescript-toolkit/$PREFIX-$RANDOM`
 *                          where `$TEMP` is the {@link tmpdir operating system's default directory for temporary files},
 *                          `$PREFIX` is the `tempDirPrefix`, and `$RANDOM` corresponds to the
 *                          randomly-generated characters appended to the end of the directory name.
 *                          
 *                          When omitted, the temporary directory will
 *                          instead have a path of the following format:
 *                          `$TEMP/typescript-toolkit/$RANDOM` where `$TEMP` is
 *                          the {@link tmpdir operating system's default directory for temporary files}
 *                          and `$RANDOM` corresponds to the randomly-generated characters appended
 *                          to the end of the directory name.
 * 
 * @throws                  An {@link Error} if the designated file was not
 *                          successfully updated with the specified `contents`.
 */
export function writeFile (
    filepath: string,
    contents: string,
    dryRun?: boolean,
    tempDirSuffix?: string
): void;
export function writeFile (
    filepath: string,
    contents: string,
    optionsOrDryRun?: WriteFileOptions | boolean,
    tempDirSuffix?: string
): void {

    /** Options to use when writing the file. */
    let options: Required<WriteFileOptions> = (() => {

        let options: Required<WriteFileOptions> = {
            dryRun: false,
            tempDirPrefix: ''
        };

        if (typeof optionsOrDryRun == 'object') {
            Object.assign(options, optionsOrDryRun);
        }
        else {
            if (typeof optionsOrDryRun == 'boolean')
                options.dryRun = optionsOrDryRun;
            if (typeof tempDirSuffix == 'string')
                options.tempDirPrefix = tempDirSuffix;
        }

        return options;

    })();
    /** The path to the temporary file directory. */
    let tempFileDir: string = (() => {

        /**
         * The path to the base directory where temporary files
         * for TypeScript Toolkit Tools are to be stored.
         */
        const BASE_TEMP_DIR = Path.join(tmpdir(), 'typescript-toolkit');

        if ( !(options.tempDirPrefix in tempDirs) ) {
            // Ensure the BASE_TEMP_DIR exists.
            if ( !existsSync(BASE_TEMP_DIR) )
                mkdirSync(BASE_TEMP_DIR);

            tempDirs[options.tempDirPrefix] = mkdtempSync(
                Path.join(
                    BASE_TEMP_DIR,
                    options.tempDirPrefix
                        ? `${options.tempDirPrefix}-`
                        : ''
                )
            );
        }
        
        return tempDirs[options.tempDirPrefix];

    })();
    /** The {@link prettyPath pretty} `filePath`. */
    let prettyFilePath = prettyPath(filepath);

    if (!options.dryRun) {
        try {
            const tempfileName = `${tempFileDir}${Path.sep}${Path.basename(filepath)}`;
    
            // Write the contents to a temporary file before
            // replacing the existing file with the new one.
            writeFileSync(tempfileName, contents, { encoding: 'utf-8' });
            copyFileSync(tempfileName, filepath);
            rmSync(tempfileName);
            console.log(`Successfully updated file ${prettyFilePath}.`);
        }
        catch (error) {
            throw new Error(
                `Failed to commit changes to file ${prettyFilePath}: ${(error as Error).message}`,
                { cause: error }
            );
        }
    }
    else {
        console.log(`\nChanges to be made to file ${prettyFilePath}:`);
        console.log(indentOutput(contents));
    }

}

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
 * 
 * @see             {@link stringifyJson `stringifyJson()`}
 */
export const readJsonFile = <T extends Record<string, any>> ( filePath: string ): T => JSON.parse(readFile(filePath));
/**
 * A helper function to `string`-ify the designated JSON `data`.
 * 
 * @param data  The `JSON` data being `string`-ified.
 * 
 * @returns     A valid JSON `string` terminated by a newline (`/n`).
 * 
 * @see         {@link readJsonFile `readJsonFile()`}
 */
export const stringifyJson = ( data: Record<string, any> ): string => `${JSON.stringify(data, null, 2)}\n`;
/**
 * Retrieve the {@link PackageConfig} from the
 * NPM Package Configuration (`/package.json`).
 * 
 * @returns     The {@link PackageConfig Parsed NPM Package Configuration}.
 * 
 * @throws      An {@link Error} if the NPM Package Configuration could
 *              not be successfully retrieved or parsed.
 * 
 * @see         {@link updatePackageConfig `updatePackageConfig()`}
 * @see         {@link fetchToolkitSchema `fetchToolkitSchema()`}
 * @see         {@link readJsonFile `readJsonFile()`}
 */
export function fetchPackageConfig (): PackageConfig {

    try {
        return readJsonFile(PACKAGE_CONFIG_PATH);
    }
    catch (error) {
        throw new Error(
            `Failed to retrieve the NPM Package Configuration: ${(error as Error).message}`,
            { cause: error }
        );
    }

}
/**
 * Update the NPM Package Configuration (`/package.json`)
 * to reflect the specified {@link PackageConfig} object.
 * 
 * @param config            The {@link PackageConfig} representing the
 *                          Modified NPM Package Configuration.
 * 
 * @param dryRun            Indicates whether or not to print to the console
 *                          what changes would have been made to the configuration
 *                          file instead of actually making them.
 * 
 * @param tempDirPrefix     The {@link WriteFileOptions.tempDirPrefix Temporary Directory Prefix}
 *                          for {@link writeFile `writeFile()`} to use.
 * 
 * @throws                  An {@link Error} if the NPM Package Configuration
 *                          could not be successfully updated.
 * 
 * @see                     {@link fetchToolkitSchema `fetchToolkitSchema()`}
 * @see                     {@link updateToolkitSchema `updateToolkitSchema()`}
 * @see                     {@link stringifyJson `stringifyJson()`}
 * @see                     {@link writeFile `writeFile()`}
 */
export function updatePackageConfig (
    config: PackageConfig,
    dryRun: boolean = false,
    tempDirPrefix?: string
): void {

    try {
        writeFile(TOOLKIT_SCHEMA_PATH, stringifyJson(config), { dryRun, tempDirPrefix });
    
        if (!dryRun)
            console.log("Successfully updated the NPM Package Configuration.");
    }
    catch (error) {
        throw new Error(
            `Failed to update the NPM Package Configuration: ${(error as Error).message}`,
            { cause: error }
        );
    }

}


/* Exported Constants */

/**
 * The path to the root of the project.
 * 
 * @see {@link TOOLKIT_PATH}
 */
export const ROOT_PATH = "../";
/**
 * The path to the `/toolkit` Directory containing
 * the main TypeScript Toolkit Codebase.
 * 
 * @see {@link ROOT_PATH}
 */
export const TOOLKIT_PATH = `${ROOT_PATH}/toolkit`;
/**
 * The path to the NPM Package Configuration (`/package.json`).
 */
export const PACKAGE_CONFIG_PATH = `${ROOT_PATH}/package.json`;
/**
 * A [semver-compatible version `string`](https://semver.org/)
 * representing the current version of the NPM Package
 * according to the NPM Package Configuration (`/package.json`).
 */
export const PACKAGE_VERSION: string = (
    'npm_package_version' in process.env
        ? process.env['npm_package_version'] as string
        : fetchPackageConfig().version
);


/* Global Module Code */

// Register an event handler to remove all temporary directories
// created by the script on exit.
process.on('exit', () => {

    for (let prefix in tempDirs) {
        try {
            rmdirSync(tempDirs[prefix]);
        }
        catch (error) {
            console.error(`Failed to remove temporary directory ${tempDirs[prefix]}:`, error);
        }
    }

});