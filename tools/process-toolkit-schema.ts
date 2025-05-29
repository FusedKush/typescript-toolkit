/*
 * An automation tool capable of generating or modifying
 * various project files based on the TypeScript Toolkit Schema (toolkit/schema.json).
 * 
 * The script supports several command-line options used to customize
 * the behavior of the tool and control which actions are performed.
 * Run the script with the --usage option for more information.
 * 
 * @author Zach Vaughan (FusedKush)
 */

import {
    type ToolkitSchema,
    ToolkitExportType,
    indentOutput,
    prettyPath,
    readFile,
    readJsonFile,
    stringifyJson,
    fetchToolkitSchema,
    ROOT_PATH,
    TOOLKIT_PATH,
    writeFile
} from "./utils.ts";

import { existsSync, readdirSync } from "node:fs";
import Path from "node:path";
import YAML from "yaml";


/* Helper Types */

/**
 * An enumeration type comprised of the different methods
 * of *importing* a Toolkit Dependency into the dependent code snippet.
 */
enum DependencyImportMethod {

    /**
     * Indicates that the Toolkit Dependency is to be *bundled*
     * and included with the dependent code snippet.
     * 
     * This option is nearly identical to {@link INLINED} with
     * some slight differences in how the dependency
     * is formatted within the dependent code snippet.
     */
    BUNDLED = 'Bundled',
    /**
     * Indicates that the Toolkit Dependency is to be *inlined*
     * and included directly within the dependent code snippet.
     * 
     * This option is nearly identical to {@link BUNDLED} with
     * some slight differences in how the dependency
     * is formatted within the dependent code snippet.
     */
    INLINED = 'Inlined'

};

/**
 * A function type representing one of the
 * primary *actions* performed by the script.
 * 
 * @throws  Functions of this type may throw {@link Error}s on failure,
 *          any of which will cause the script to terminate immediately.
 */
type ScriptActionFunction = (
    /**
     * The {@link ToolkitSchema} being used to perform the action.
     */
    schema: ToolkitSchema,
    /**
     * Indicates whether or not to print to the console
     * what changes would have been made to the various
     * files instead of actually making them.
     */
    dryRun: boolean
) => void;


/* Classes & Interfaces */

/**
 * An interface containing the available *Script Options*
 * used to customize the behavior of the script and
 * specify which {@link ScriptActionFunction *actions*}
 * are to be performed.
 * 
 * @see {@link ScriptActionOptions}
 */
interface ScriptOptions {

    /**
     * Indicates whether or not to print to the console
     * what changes would have been made to the various
     * files instead of actually making them.
     */
    dryRun: boolean;

    /**
     * Whether or not to {@link verifySchema verify the Toolkit Schema}
     * before performing any other {@link ScriptActionFunction *actions*}.
     */
    verifySchema: boolean;
    /**
     * Whether or not to
     * {@link updatePackageExports update the `exports` Field in the `package.json` Configuration File}.
     */
    updatePackageExports: boolean;
    /**
     * Whether or not to
     * {@link updateIssueTemplates update the relevant GitHub Issue Templates}.
     */
    updateIssueTemplates: boolean;
    /**
     * Whether or not to
     * {@link updateReadmeFiles update the Toolkit, Namespace, and Tool `README.md` Files}.
     */
    updateReadmeFiles: boolean;
    /**
     * Whether or not to
     * {@link updateDependencyImports update Toolkit Dependency Imports}.
     */
    updateDependencyImports: boolean;

};
/**
 * An interface containing the {@link ScriptOptions available *Script Options*}
 * that are specifically used to control which {@link ScriptActionFunction *actions*}
 * are to be performed by the script.
 * 
 * This interface is just a subset of {@link ScriptOptions}
 * that omits the {@link ScriptOptions.dryRun `dryRun`} property.
 * 
 * @see {@link ScriptOptions}
 */
type ScriptActionOptions = Omit<ScriptOptions, 'dryRun'>;

/**
 * An {@link Error} indicating that the {@link ToolkitSchema TypeScript Toolkit Schema}
 * could not be successfully validated.
 */
class SchemaValidationError extends Error implements SchemaValidationError.ValidationDetails {

    readonly namespace?: string;
    readonly tool?: string;

    readonly schemaSyntaxError?: boolean;
    readonly directoryValidationError?: boolean;


    /**
     * Construct a new `SchemaValidationError`.
     * 
     * @param message   The error message to use.
     * 
     *                  The specified message will be prefixed by the phrase:
     *                  `"The TypeScript Toolkit Schema Failed Validation: "`
     * 
     *                  If omitted, a generic default error message will be used instead.
     * 
     * @param options   Optional {@link SchemaValidationError.ErrorOptions Error Options}
     *                  to use when constructing the error.
     * 
     *                  If only **one** of the {@link SchemaValidationError.ErrorOptions.schemaSyntaxError `schemaSyntaxError`}
     *                  or {@link SchemaValidationError.ErrorOptions.directoryValidationError `directoryValidationError`}
     *                  options is specified, the *other option* will automatically be set
     *                  to the **opposite value**.
     *                  > For example, if `schemaSyntaxError` is set as `true` but `directoryValidationError`
     *                    is omitted, then `directoryValidationError` will automatically be set to `false`.
     */
    constructor ( message?: string | null, options?: SchemaValidationError.ErrorOptions ) {

        super(
            `The TypeScript Toolkit Schema Failed Validation${message ? `: ${message}` : '.'}`,
            options
        );

        if (options) {
            this.namespace = options.namespace;
            this.tool = options.tool;
    
            if (typeof options.schemaSyntaxError == 'boolean' && typeof options.directoryValidationError == 'boolean') {
                this.schemaSyntaxError = options.schemaSyntaxError;
                this.directoryValidationError = options.directoryValidationError;
            }
            else if (typeof options.schemaSyntaxError == 'boolean') {
                this.schemaSyntaxError = options.schemaSyntaxError;
                this.directoryValidationError = !options.schemaSyntaxError;
            }
            else if (typeof options.directoryValidationError == 'boolean') {
                this.schemaSyntaxError = !options.directoryValidationError;
                this.directoryValidationError = options.directoryValidationError;
            }
        }
    
    }

}
namespace SchemaValidationError {

    /**
     * An interface defining the *details* associated
     * with a {@link SchemaValidationError Failed Schema Validation Attempt}.
     * 
     * This interface defines the {@link ErrorOptions Custom Error Options}
     * that can be passed to the {@link SchemaValidationError} constructor,
     * as well as the public fields available in `SchemaValidationError` errors.
     */
    export interface ValidationDetails {

        /**
         * The name of the Toolkit Namespace that was involved
         * in or the direct cause of the validation error.
         * 
         * @see {@link tool}
         */
        namespace?: string;
        /**
         * The name of the Toolkit Tool that was involved
         * in or the direct cause of the validation error.
         * 
         * This field will generally only be populated if
         * the {@link namespace} field is populated as well.
         * 
         * @see {@link namespace}
         */
        tool?: string;

        /**
         * Indicates whether an issue with the syntax of
         * the Toolkit Schema was involved in or the direct
         * cause of the validation error.
         * 
         * @see {@link directoryValidationError}
         */
        schemaSyntaxError?: boolean;
        /**
         * Indicates whether an issue with the `/toolkit` Directory
         * was involved in or the direct cause of the validation error.
         * 
         * @see {@link schemaSyntaxError}
         */
        directoryValidationError?: boolean;

    }

    /**
     * Custom {@link globalThis.ErrorOptions ErrorOptions} that can be
     * passed to the {@link SchemaValidationError} constructor.
     */
    export interface ErrorOptions extends globalThis.ErrorOptions, ValidationDetails {}

}

/**
 * An {@link Error} indicating that a TypeScript Toolkit Dependency
 * could not be successfully *imported* into a dependent code snippet.
 */
class DependencyImportError extends Error implements DependencyImportError.ImportDetails {

    readonly fileName?: string;
    readonly filePath?: string;
        
    readonly importMethod?: DependencyImportMethod;
    readonly dependency?: string;
    readonly dependencyNamespace?: string;
    readonly dependencyTool?: string;
    readonly dependencyExport?: string;


    /**
     * Construct a new `DependencyImportError`.
     * 
     * @param message   The error message to use.
     * 
     *                  If omitted, a generic default error message will be used instead.
     * 
     * @param options   Optional {@link DependencyImportError.ErrorOptions Error Options}
     *                  to use when constructing the error.
     */
    constructor ( message?: string | null, options?: DependencyImportError.ErrorOptions ) {

        super(
            message ?? (
                `Failed to import${options?.importMethod ? ` ${options.importMethod}` : ''} TypeScript Toolkit Dependency`
                    + (
                        ((options?.fileName || options?.filePath) && options?.dependency)
                            ? `'${options.dependency}' in file ${options.fileName ?? options.filePath}.`
                            : '.'
                    )
            ),
            options
        );

        if (options) {
            this.fileName = options.fileName;
            this.importMethod = options.importMethod;
            this.dependency = options.dependency;
            this.dependencyNamespace = options.dependencyNamespace;
            this.dependencyTool = options.dependencyTool;
            this.dependencyExport = options.dependencyExport;
            
            if (options.filePath)
                this.filePath = prettyPath(options.filePath);
        }
    
    }

}
namespace DependencyImportError {

    /**
     * An interface defining the *details* associated
     * with a {@link DependencyImportError Failed Dependency Import}.
     * 
     * This interface defines the {@link ErrorOptions Custom Error Options}
     * that can be passed to the {@link DependencyImportError} constructor,
     * as well as the public fields available in `DependencyImportError` errors.
     */
    export interface ImportDetails {

        /**
         * The *name* of the *Dependent Code Snippet File*.
         * 
         * In general, this field will only be populated if
         * the {@link filePath} field is populated as well.
         * 
         * @see {@link filePath}
         */
        fileName?: string;
        /**
         * The *path* to the *Dependent Code Snippet File*.
         * 
         * In general, this field will only be populated if
         * the {@link fileName} field is populated as well,
         * as the `filePath` will always contain the full
         * `fileName` at the end of the path. 
         * 
         * @see {@link fileName}
         */
        filePath?: string;
        
        /**
         * The {@link DependencyImportMethod method} being used
         * to import the Toolkit Dependency.
         */
        importMethod?: DependencyImportMethod;
        /**
         * The *Toolkit Dependency* being imported.
         * 
         * The dependency is generally specified as a `string` of the
         * format `NAMESPACE/TOOL/EXPORT`, though the specified `string`
         * may be of any format (as a malformed dependency `string` would
         * cause an import error).
         * 
         * When this field is populated with a `string` containing one
         * or more valid components as specified above, the
         * {@link dependencyNamespace}, {@link dependencyTool},
         * and {@link dependencyExport} may also be populated
         * with the respective components of the Toolkit Dependency.
         * 
         * @see {@link importMethod}
         * @see {@link dependencyNamespace}
         * @see {@link dependencyTool}
         * @see {@link dependencyExport}
         */
        dependency?: string;
        /**
         * The *Namespace* of the Toolkit Dependency being imported.
         * 
         * This field will generally only be populated when the {@link dependency}
         * field contains, at a minimum, a namespace component of the
         * Toolkit Dependency being imported.
         * 
         * This field will generally always be populated when the
         * {@link dependencyTool} and {@link dependencyExport} fields
         * are themselves populated.
         * 
         * @see {@link dependencyTool}
         * @see {@link dependencyExport}
         */
        dependencyNamespace?: string;
        /**
         * The *Tool* of the Toolkit Dependency being imported.
         * 
         * This field will generally only be populated when the {@link dependency}
         * field contains, at a minimum, a namespace and tool component of the
         * Toolkit Dependency being imported.
         * 
         * This field will generally always be populated when the
         * {@link dependencyExport} fields are themselves populated.
         * 
         * @see {@link dependencyNamespace}
         * @see {@link dependencyExport}
         */
        dependencyTool?: string;
        /**
         * The *TypeScript/JavaScript Export* of the Toolkit Dependency being imported.
         * 
         * This field will generally only be populated when the {@link dependency}
         * field contains all of the required components of the
         * Toolkit Dependency being imported.
         * 
         * @see {@link dependencyNamespace}
         * @see {@link dependencyTool}
         */
        dependencyExport?: string;

    }

    /**
     * Custom {@link globalThis.ErrorOptions ErrorOptions} that can be
     * passed to the {@link DependencyImportError} constructor.
     */
    export interface ErrorOptions extends globalThis.ErrorOptions, ImportDetails {}

}


/* Constants & Variables */

/**
 * A mapping of files to their modified contents
 * used to record all of the changes made to files
 * by the script.
 * 
 * @see {@link recordChanges `recordChanges()`}
 * @see {@link commitChanges `commitChanges()`}
 * @see {@link printChanges `printChanges()`}
 */
var changes: Record<string, string> = {};


/* Helper Functions */
// YAML Serialization and File Management

/**
 * A helper function to synchronously retrieve
 * and parse the contents of a `YAML` File.
 * 
 * @param filePath  The path to the `YAML` File being read.
 * 
 * @returns         A {@link YAML.Document.Parsed YAML Document} representing
 *                  the parsed contents of the specified `YAML` File.
 * 
 * @throws          A {@link YAML.YAMLError YAMLError} if the contents of the specified
 *                  file does not form a valid YAML `string`.
 */
const readYamlFile = ( filePath: string ) => YAML.parseDocument(readFile(filePath));
/**
 * A helper function to `string`-ify the designated YAML `data`.
 * 
 * @param data  The `YAML` data being `string`-ified.
 * 
 * @returns     A valid YAML `string` terminated by a newline (`/n`).
 */
const stringifyYaml = ( data: YAML.Document ): string => data.toString({ flowCollectionPadding: false, lineWidth: 0 });


// File Changes

/**
 * Record changes made to a file by the script.
 * 
 * @param file              The path to the file that was modified.
 * @param modifiedContents  The modified contents of the file.
 * 
 * @throws                  An {@link Error} if conflictiing changes have already
 *                          been recorded for the specified `file`.
 * 
 * @see                     {@link commitChanges `commitChanges()`}
 */
function recordChanges ( file: string, modifiedContents: string ) {

    if (file in changes)
        throw new Error(`Conflicting changes have already been recorded for ${prettyPath(file)}!`);

    changes[file] = modifiedContents;

};
/**
 * Commit all of the changes made to files by this script.
 * 
 * If the `dryRun` argument is omitted or `false`,
 * the {@link changes `changes`} map will be empty
 * after successfully invoking this function.
 * 
 * @param dryRun    Indicates whether or not to print to the console
 *                  what changes would have been made to the various
 *                  files instead of actually making them.
 * 
 * @see             {@link recordChanges `recordChanges()`}
 * @see             {@link writeFile `writeFile()`}
 */
function commitChanges ( dryRun: boolean = false ) {

    for (let file in changes)
        writeFile(file, changes[file], { dryRun: dryRun, tempDirPrefix: 'process-toolkit-schema' });
    
    if (!dryRun)
        changes = {};

}


/* Script Actions */

/**
 * Verify the specified {@link ToolkitSchema}, validating
 * both its syntax and the correctness of the `/toolkit` directory
 * and raising a {@link SchemaValidationError} if there are problems
 * with either of them.
 * 
 * @param schema    The {@link ToolkitSchema} being verified.
 * 
 * @param dryRun    Indicates whether or not to print to the console
 *                  what changes would have been made to the various
 *                  files instead of actually making them.
 * 
 *                  Because this action does not make any changes to any files,
 *                  this argument has no effect on this action.
 * 
 * @throws          A {@link SchemaValidationError} if the specified `schema`
 *                  failed validation.
 */
const verifySchema: ScriptActionFunction = (schema, dryRun) => {

    try {
        for (const namespaceName in schema) {
            const namespace = schema[namespaceName];
            
            if (!existsSync(`${TOOLKIT_PATH}/${namespaceName}`)) {
                throw new SchemaValidationError(
                    `Missing Namespace '${namespaceName}' in the /toolkit Directory.`,
                    {
                        namespace: namespaceName,
                        directoryValidationError: true
                    }
                );
            }
    
            for (const toolName in namespace.tools) {
                const tool = namespace.tools[toolName];
                const fullToolName = `${namespaceName}/${toolName}`;
    
                if (tool.dependencies) {
                    // Validate Tool Dependencies
                    tool.dependencies.forEach((dependency) => {
    
                        const segments = dependency.split('/', 2);
                        
                        if ( !(segments[0] in schema) ) {
                            throw new SchemaValidationError(
                                `Unknown Namespace '${segments[0]}' specified as a Dependency for '${fullToolName}'.`,
                                {
                                    namespace: namespaceName,
                                    tool: toolName,
                                    schemaSyntaxError: true
                                }
                            );
                        }
                        else if ( !(segments[1] in (schema[segments[0]].tools ?? {})) ) {
                            throw new SchemaValidationError(
                                `Unknown Tool '${segments[1]}' in Namespace '${segments[0]}' specified as a Dependency for '${fullToolName}'.`,
                                {
                                    namespace: namespaceName,
                                    tool: toolName,
                                    schemaSyntaxError: true
                                }
                            );
                        }
    
                    });
                }
    
                if (!existsSync(`${TOOLKIT_PATH}/${fullToolName}`)) {
                    throw new SchemaValidationError(
                        `Missing Tool '${toolName}' in Namespace '${namespaceName}' in the /toolkit Directory.`,
                        {
                            namespace: namespaceName,
                            tool: toolName,
                            directoryValidationError: true
                        }
                    );
                }
            }
        }

        if (!dryRun)
            console.log("[+] Toolkit Schema Validated.");
        else
            console.log("Successfully Validated the Toolkit Schema!");
    }
    catch (error) {
        if (error instanceof SchemaValidationError) {
            throw error;
        }
        else {
            throw new SchemaValidationError(
                `An unexpected error occurred while validating the Toolkit Schema.`,
                { cause: error }
            );
        }
    }

};
/**
 * Update the `exports` field of the `package.json` NPM Configuration File.
 * 
 * @param schema    The {@link ToolkitSchema} being used to update the exports.
 * 
 * @param dryRun    Indicates whether or not to print to the console
 *                  what changes would have been made to the `package.json`
 *                  file instead of actually making them.
 * 
 * @throws          An {@link Error} if the `package.json` file could
 *                  not be successfully updated.
 */
const updatePackageExports: ScriptActionFunction = (schema) => {

    /**
     * A partial interface representing the relevant
     * fields of the parsed `package.json` NPM Configuration.
     */
    interface PackageConfig {

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

        }
        /**
         * Represents all of the other fields in the configuration file.
         */
        [x: string]: any;

    }

    /**
     * The path to the `package.json` NPM Configuration File.
     */
    const PACKAGE_JSON_PATH = `${ROOT_PATH}/package.json`;

    /**
     * A helper function to get the path to the
     * specified Toolkit Namespace or Tool in
     * the `/dist` Directory.
     * 
     * @param segments  The segments used to identify the
     *                  Toolkit Namespace or Tool.
     * 
     * @returns         The path to the Toolkit Namespace or Tool
     *                  in the `/dist` Directory.
     */
    const getDistFilePath = ( ...segments: string[] ) => `./dist/${segments.join('/')}/index.js` as const;

    try {
        let packageConfig: PackageConfig = readJsonFile(PACKAGE_JSON_PATH);
            packageConfig.exports = { ".": "./dist/index.js" };

        for (const namespace in schema) {
            packageConfig['exports'][`./${namespace}`] = getDistFilePath(namespace);
            
            for (const tool in schema[namespace].tools)
                packageConfig['exports'][`./${namespace}/${tool}`] = getDistFilePath(namespace, tool);
        }

        recordChanges(PACKAGE_JSON_PATH, stringifyJson(packageConfig));
    }
    catch (error) {
        throw new Error(
            `Failed to update the package.json Configuration File: ${(error as Error).message}`,
            { cause: error }
        );
    }

};
/**
 * Update the relevant GitHub Issue Templates.
 * 
 * @param schema    The {@link ToolkitSchema} being used to update the issue templates.
 * 
 * @param dryRun    Indicates whether or not to print to the console
 *                  what changes would have been made to the issue templates
 *                  instead of actually making them.
 * 
 * @throws          An {@link Error} if any of the issue templates could
 *                  not be successfully updated.
 */
const updateIssueTemplates: ScriptActionFunction = (schema) => {

    /** The path to the directory containing the issue templates. */
    const ISSUE_TEMPLATE_DIRECTORY_PATH = `${ROOT_PATH}/.github/ISSUE_TEMPLATE`;

    /** The name of the "Toolkit Tool Issue Report" Issue Template. */
    const TOOLKIT_TOOL_ISSUE_REPORT_NAME = "Toolkit Tool Issue Report";
    /** The path to the "Toolkit Tool Issue Report" Issue Template. */
    const TOOLKIT_TOOL_ISSUE_REPORT_PATH = `${ISSUE_TEMPLATE_DIRECTORY_PATH}/1-toolkit-tool-issue.yml`;
    
    /** The path to the "Requests and Suggestions" Issue Template. */
    const REQUESTS_AND_SUGGESTIONS_PATH = `${ISSUE_TEMPLATE_DIRECTORY_PATH}/3-requests-and-suggestions.yml`;
    /** The name of the "Requests and Suggestions" Issue Template. */
    const REQUESTS_AND_SUGGESTIONS_NAME = "Requests and Suggestions";

    /**
     * The base options added to the end of the `options`
     * list for the "Requests and Suggestions" Issue Template
     * following the Toolkit Namespace and Tool options.
     */
    const REQUESTS_AND_SUGGESTIONS_BASIC_OPTIONS = [
        "Project Documentation",
        "API Documentation Wiki",
        "Project Layout, Organization, or Architecture",
        "Code Snippet Usage",
        "NPM Package Installation, Deployment, or Usage",
        "Contributing",
        "Other"
    ];

    
    /* Update "Toolkit Tool Issue Report" Issue Template */
    
    try {
        let yamlDoc = readYamlFile(TOOLKIT_TOOL_ISSUE_REPORT_PATH);
        let toolList = (
            (
                (
                    (yamlDoc.get('body') as YAML.YAMLSeq).items[2] as YAML.YAMLMap
                ).get('attributes') as YAML.YAMLMap
            ).get('options') as YAML.YAMLSeq
        ).items as string[];

        // Ensure `labels` are specified as an inline array.
        (yamlDoc.get('labels') as YAML.YAMLSeq).flow = true;
        // Empty the tool list so it can be repopulated.
        toolList.length = 0;

        for (const namespace in schema) {
            const tools = schema[namespace].tools;

            for (const tool in tools) {
                const exportList = tools[tool].exports;

                toolList.push(`\`${namespace}/${tool}\``);

                for (const exportName in exportList)
                    toolList.push(`  - \`${namespace}/${exportName}${exportList[exportName].type == 'function' ? '()' : ''}\``);
            }
        }

        recordChanges(TOOLKIT_TOOL_ISSUE_REPORT_PATH, stringifyYaml(yamlDoc));
    }
    catch (error) {
        throw new Error(
            `Failed to update the "${TOOLKIT_TOOL_ISSUE_REPORT_NAME}" Issue Template: ${(error as Error).message}`,
            { cause: error }
        );
    }


    /* Update "Requests and Suggestions" Issue Template */

    try {
        let yamlDoc = readYamlFile(REQUESTS_AND_SUGGESTIONS_PATH);
        let optionList = (
            (
                (
                    (yamlDoc.get('body') as YAML.YAMLSeq).items[2] as YAML.YAMLMap
                ).get('attributes') as YAML.YAMLMap
            ).get('options') as YAML.YAMLSeq
        ).items as string[];

        // Ensure `labels` are specified as an inline array.
        (yamlDoc.get('labels') as YAML.YAMLSeq).flow = true;

        // Empty the tool list so it can be repopulated.
        optionList.length = 0;
        optionList.push("Toolkit Namespaces");

        for (const namespace in schema)
            optionList.push(`  - \`${namespace}\``);

        optionList.push('Toolkit Tools');

        for (const namespace in schema) {
            const tools = schema[namespace].tools;

            for (const tool in tools) {
                const exportList = tools[tool].exports;

                optionList.push(`  - \`${namespace}/${tool}\``);

                for (const exportName in exportList)
                    optionList.push(`    + \`${namespace}/${exportName}${exportList[exportName].type == 'function' ? '()' : ''}\``);
            }
        }

        optionList.push(...REQUESTS_AND_SUGGESTIONS_BASIC_OPTIONS);
        recordChanges(REQUESTS_AND_SUGGESTIONS_PATH, stringifyYaml(yamlDoc));
    }
    catch (error) {
        throw new Error(
            `Failed to update the "${REQUESTS_AND_SUGGESTIONS_NAME}" Issue Template: ${(error as Error).message}`,
            { cause: error }
        );
    }

};
/**
 * Update the relevant Toolkit, Namespace,
 * and Tool `README.md` Files.
 * 
 * @param schema    The {@link ToolkitSchema} being used to update the `README.md` files.
 * 
 * @param dryRun    Indicates whether or not to print to the console
 *                  what changes would have been made to the `README.md` files
 *                  instead of actually making them.
 * 
 * @throws          An {@link Error} if any of the `README.md` files could
 *                  not be successfully updated.
 */
const updateReadmeFiles: ScriptActionFunction = (schema) => {

    /** The path to the main Toolkit `README.md` File. */
    const TOOLKIT_README_PATH = `${TOOLKIT_PATH}/README.md`;

    /**
     * A mapping of Toolkit Dependencies to an
     * array of Dependent Code Snippets.
     * 
     * This field will not be populated until the
     * first pass through the Toolkit Schema.
     */
    let dependencies: Record<string, string[]> = {};


    /* Update Main Toolkit Readme */

    try {
        let readmeContents = readFile(TOOLKIT_README_PATH);
        
        readmeContents = readmeContents.replace(
            new RegExp('(## Namespaces)(?:[^#]|#(?![# ]+))+', 'm'),
            (match, p1) => {

                let namespaces = p1;

                for (const namespaceName in schema) {
                    const namespace = schema[namespaceName];

                    namespaces += `\n- [\`${namespaceName}\`](${namespaceName}): ${namespace.markdownDescription ?? namespace.description}`;
                }

                return namespaces;

            }
        );

        recordChanges(TOOLKIT_README_PATH, readmeContents);
    }
    catch (error) {
        throw new Error(
            `Failed to update the Main Toolkit Readme File: ${(error as Error).message}`,
            { cause: error }
        );
    }


    /* Update Toolkit Namespace Readme Files */

    for (const namespaceName in schema) {
        try {
            const namespace = schema[namespaceName];
            const readmePath = `${TOOLKIT_PATH}/${namespaceName}/README.md`;
            let readmeContents = readFile(readmePath);
            
            readmeContents = readmeContents.replace(
                new RegExp('(## Tool List)(?:[^#]|#(?![# ]+))+', 'm'),
                (match, p1) => {

                    let toolList = p1;

                    for (const toolName in namespace.tools) {
                        const tool = namespace.tools[toolName];

                        toolList += `\n- [\`${toolName}\`](${toolName}): ${tool.markdownDescription ?? tool.description}`;

                        if (tool.dependencies && tool.dependencies.length > 0) {
                            tool.dependencies.forEach((dependency) => {

                                if (!(dependency in dependencies)) {
                                    dependencies[dependency] = [];
                                }

                                dependencies[dependency].push(`${namespaceName}/${toolName}`);

                            });
                        }
                    }

                    return `${toolList}\n\n\n`;

                }
            );

            recordChanges(readmePath, readmeContents);
        }
        catch (error) {
            throw new Error(
                `Failed to update readme for Namespace '${namespaceName}': ${(error as Error).message}`,
                { cause: error }
            );
        }
    }


    /* Update Toolkit Tool Readme Files */

    for (const namespaceName in schema) {
        const namespace = schema[namespaceName];

        for (const toolName in namespace.tools) {
            const fullToolName = `${namespaceName}/${toolName}`;
            const tool = namespace.tools[toolName];
            
            if (fullToolName in dependencies || (tool.dependencies?.length ?? 0) > 0) {
                try {
                    const readmePath = `${TOOLKIT_PATH}/${fullToolName}/README.md`;
                    let readmeContents = readFile(readmePath);
                    
                    if (tool.dependencies && tool.dependencies.length > 0) {
                        readmeContents = readmeContents.replace(
                            new RegExp('(- \\*\\*Depends On\\*\\*:).+(?=\n- \\*\\*Dependents)', 'ms'),
                            (match, p1) => {
            
                                let dependencyList = p1;
    
                                (tool.dependencies as string[]).forEach((dependency) => (
                                    dependencyList += `\n  - [\`${dependency}\`](${Path.posix.relative(`toolkit/${fullToolName}`, `toolkit/${dependency}`)})`
                                ));
            
                                return dependencyList;
            
                            }
                        );
                    }
                    if (fullToolName in dependencies) {
                        readmeContents = readmeContents.replace(
                            new RegExp('(- \\*\\*Dependents\\*\\*:)(?:[^#]|#(?![# ]+))+', 'm'),
                            (match, p1) => {
            
                                let dependentList = p1;

                                dependencies[fullToolName].forEach((dependent) => (
                                    dependentList += `\n  - [\`${dependent}\`](${Path.posix.relative(`toolkit/${fullToolName}`, `toolkit/${dependent}`)})`
                                ));
            
                                return `${dependentList}\n\n\n`;
            
                            }
                        );
                    }

                    recordChanges(readmePath, readmeContents);
                }
                catch (error) {
                    throw new Error(
                        `Failed to update readme for Tool '${fullToolName}': ${(error as Error).message}`,
                        { cause: error }
                    );
                }
            }
        }
        
    }

};
/**
 * Update the Toolkit Dependency Imports and either bundle
 * or inline the dependencies into the dependent code snippets.
 * 
 * @param schema    The {@link ToolkitSchema} being used to update
 *                  the Toolkit Dependency Imports.
 * 
 * @param dryRun    Indicates whether or not to print to the console
 *                  what changes would have been made to the dependent
 *                  code snippets instead of actually making them.
 * 
 * @throws          A {@link DependencyImportError} if any of the
 *                  dependent code snippets could not be successfully updated.
 */
const updateDependencyImports: ScriptActionFunction = (schema) => {

    /**
     * The {@link RegExp Regular Expression} used to match
     * Dependent Import Comments within the Dependent Code Snippets.
     */
    const DEPENDENCY_IMPORT_REGEX = (() => {

        const BASE_REGEX = "@(bundle|inline)Dependency ([a-zA-Z0-9.]+)";

        return new RegExp(
            `( *)(?:(?:\\/{2,} ${BASE_REGEX})|(?:\\/\\*[^@]* ${BASE_REGEX}[^@]*\\*\\/))`,
            'g'
        );

    })();
    /**
     * The {@link RegExp Regular Expression} used to match the
     * Documentation Block that appears above each member
     * being imported. 
     */
    const CODE_SNIPPET_DOCBLOCK_REGEX = "\\/\\*{2}(?:[^*]|\\*(?!\\/))+\\*\\/\\s+";

    for (const namespaceName in schema) {
        /** The Dependent Toolkit Namespace. */
        const namespace = schema[namespaceName];

        for (const toolName in namespace.tools) {
            /** The Dependent Toolkit Tool. */
            const tool = namespace.tools[toolName];
            /** The Full Name of the Dependent Toolkit Tool. */
            const fullToolName = `${namespaceName}/${toolName}`;

            if (tool.dependencies && tool.dependencies.length > 0) {
                (['ts', 'js'] as const).forEach((scriptType) => {

                    /** The path to the directory containing the Dependent Code Snippets. */
                    const scriptsPath = `${TOOLKIT_PATH}/${fullToolName}/${scriptType}`;
                    /**
                     * The path to the `/src` directory within the directory
                     * containing the Dependent Code Snippets.
                     */
                    const srcPath = `${scriptsPath}/src`;
    
                    if (existsSync(srcPath)) {
                        /** The contents of the directory containing the Dependent Code Snippets. */
                        const files = readdirSync(srcPath, { withFileTypes: true });
    
                        files.forEach((file) => {

                            if (file.isFile()) {
                                /** The path to the Dependent Code Snippet File in the `/src` Directory. */
                                let srcFilePath = `${srcPath}/${file.name}`;
                                /** The destination path for the Dependent Code Snippet. */
                                let destFilePath = `${scriptsPath}/${file.name}`;
                                /** The contents of the Dependent Code Snippet File. */
                                let fileContents = readFile(srcFilePath);
                                /**
                                 * Indicates whether or not we are currently processing
                                 * the first match in the file.
                                 * 
                                 * This variable is primarily used to only
                                 * insert whitespace between adjacent members.
                                 */
                                let firstMatch: boolean = true;
                                    
                                fileContents = fileContents.replaceAll(
                                    DEPENDENCY_IMPORT_REGEX,
                                    (match, p1, p2, p3, p4, p5) => {

                                        /** Which branch of the regular expression was matched. */
                                        let branch: 'left' | 'right' = (p2 === undefined ? 'right' : 'left');
                                        /** The extracted indentation string. */
                                        let indent: string = p1;
                                        /** The tag used to import the dependency. */
                                        let depTag: 'bundle' | 'inline' = (branch == 'left' ? p2 : p4);
                                        /** Which method to use when importing the dependency. */
                                        let depType: DependencyImportMethod = (depTag == 'bundle' ? DependencyImportMethod.BUNDLED : DependencyImportMethod.INLINED);
                                        /** The Toolkit Dependency being imported. */
                                        let dependency: string = (branch == 'left' ? p3 : p5);
                                        /** The individual segments of the Toolkit Dependency being imported. */
                                        let segments: string[] = dependency.split('.');
                                        /** The common options used when throwing a DependencyImportError. */
                                        let baseErrorOptions: DependencyImportError.ErrorOptions = {
                                            fileName: file.name,
                                            filePath: srcFilePath,
                                            dependency: dependency,
                                            importMethod: depType
                                        };

                                        if (segments.length != 3) {
                                            throw new DependencyImportError(
                                                `An invalid ${depType} Dependency was specified in ${file.name}: ${dependency}`,
                                                baseErrorOptions
                                            );
                                        }

                                        // Ensure the specified Toolkit Namespace exists.
                                        if (segments[0] in schema) {
                                            /** The Toolkit Namespace being imported. */
                                            const depNamespace = schema[segments[0]];

                                            // Ensure the specified Toolkit Tool exists.
                                            if (segments[1] in (depNamespace.tools ?? {})) {
                                                /** The Toolkit Tool being imported. */
                                                const depTool = depNamespace.tools![segments[1]];

                                                // Ensure the specified Toolkit Export exists.
                                                if (segments[2] in depTool.exports) {
                                                    /** The TypeScript/JavaScript Member being imported. */
                                                    const depExport = depTool.exports[segments[2]];

                                                    // Ensure only non-global members are being imported.
                                                    if (depExport.type != 'global') {
                                                        /**
                                                         * The {@link RegExp Regular Expression} used to extract the
                                                         * dependency from the code snippet file,
                                                         * which is based on the {@link ToolkitExportType type}
                                                         * of member that is being imported.
                                                         */
                                                        const codeRegex: RegExp = (() => {

                                                            switch (depExport.type) {

                                                                case ToolkitExportType.TYPE:
                                                                    return new RegExp(
                                                                        scriptType == 'ts'
                                                                            ? `${CODE_SNIPPET_DOCBLOCK_REGEX}type ${segments[2]}[^=]+=.+?(?:(?:;|\n(?=\n))|$)`
                                                                            : `(?:\\/{2} ${segments[2]}\\s+)?\\/\\*{2}(?:[^*]|\\*(?!\\/))+\\@typedef {.+?} ${segments[2]}(?:[^*]|\\*(?!\\/))+\\*\\/`,
                                                                        's'
                                                                    );

                                                                case ToolkitExportType.INTERFACE:
                                                                    return new RegExp(
                                                                        scriptType == 'ts'
                                                                            ? `${CODE_SNIPPET_DOCBLOCK_REGEX}(?:interface|type) ${segments[2]}[^{]+{(?:[^{}]|{.+})+}`
                                                                            : `(?:\\/{2} ${segments[2]}\\s+)?\\/\\*{2}(?:[^*]|\\*(?!\\/))+\\@typedef {.+?} ${segments[2]}(?:[^*]|\\*(?!\\/))+\\*\\/`,
                                                                        's'
                                                                    );

                                                                case ToolkitExportType.CLASS:
                                                                    return new RegExp(`${CODE_SNIPPET_DOCBLOCK_REGEX}class ${segments[2]}[^{]+{(?:[^{}]|{.+})+}`, 's');

                                                                case ToolkitExportType.FUNCTION:
                                                                    return new RegExp(`${CODE_SNIPPET_DOCBLOCK_REGEX}(?:function|const|var|let) ${segments[2]}[^{]+{(?:[^{}]|{.+})+}`, 's');
                                                                
                                                                case ToolkitExportType.CONSTANT:
                                                                    return new RegExp(`${CODE_SNIPPET_DOCBLOCK_REGEX}const ${segments[2]}[^=]+=.+?(?:(?:;|\n(?=\n))|$`, 's');
                                                                
                                                                case ToolkitExportType.VARIABLE:
                                                                    return new RegExp(`${CODE_SNIPPET_DOCBLOCK_REGEX}(?:const|var|let) ${segments[2]}[^=]+=.+?(?:(?:;|\n(?=\n))|$`, 's');
                                                            
                                                                }

                                                        })();
                                                        /** The path to the Toolkit Dependency being imported. */
                                                        const depToolDirPath = `${TOOLKIT_PATH}/${segments[0]}/${segments[1]}/${scriptType}`;
                                                        /** The path to the Toolkit Dependency Code Snippet File being imported. */
                                                        const depToolFilePath: string = (() => {

                                                            if (existsSync(depToolDirPath)) {
                                                                /** Which candidate files to look for. */
                                                                const filesToCheck = [
                                                                    file.name,
                                                                    `${depType.toLowerCase()}-deps.${scriptType}`,
                                                                    `index.${scriptType}`
                                                                ];
                                                                
                                                                for (let i = 0; i < filesToCheck.length; i++) {
                                                                    /** The current file being checked. */
                                                                    const file = `${depToolDirPath}/${filesToCheck[i]}`;

                                                                    if (existsSync(file))
                                                                        return file;
                                                                }

                                                                throw new DependencyImportError(
                                                                    `Failed to import '${segments[2]}' from Tool '${segments[1]}' in Namespace '${segments[0]}' as a ${depType} Dependency in ${file.name}: A suitable source code file could not be found.`,
                                                                    Object.assign({}, baseErrorOptions, {
                                                                        dependencyNamespace: segments[0],
                                                                        dependencyTool: segments[1],
                                                                        dependencyExport: segments[2]
                                                                    } as DependencyImportError.ErrorOptions)
                                                                );
                                                            }
                                                            else {
                                                                throw new DependencyImportError(
                                                                    `Failed to import '${segments[2]}' from Tool '${segments[1]}' in Namespace '${segments[0]}' as a ${depType} Dependency in ${file.name}: ${depToolDirPath} could not be found.`,
                                                                    Object.assign({}, baseErrorOptions, {
                                                                        dependencyNamespace: segments[0],
                                                                        dependencyTool: segments[1],
                                                                        dependencyExport: segments[2]
                                                                    } as DependencyImportError.ErrorOptions)
                                                                );
                                                            }

                                                        })();
                                                        /** The contents of the Toolkit Dependency Code Snippet File. */
                                                        const depToolFileContents = readFile(depToolFilePath);
                                                        /** The extracted member from the Toolkit Dependency Code Snippet File. */
                                                        const depExportContents = depToolFileContents.match(codeRegex);

                                                        if (depExportContents) {
                                                            /** The replacement string being returned. */
                                                            let replacementString = "";

                                                            if (depType == DependencyImportMethod.BUNDLED) {
                                                                if (!firstMatch) {
                                                                    replacementString += '\n';
                                                                }
                                                            }
                                                            else {
                                                                replacementString += `${indent}// Inlined TypeScript Toolkit Dependency\n`;
                                                            }
                                                            
                                                            replacementString += depExportContents[0].replaceAll(/^(?!$)/gm, `${indent}`);
                                                            firstMatch = false;
                                                            return replacementString;
                                                        }
                                                        else {
                                                            throw new DependencyImportError(
                                                                `Cannot import '${segments[2]}' from Tool '${segments[1]}' in Namespace '${segments[0]}' as a ${depType} Dependency in ${file.name}: Failed to find '${segments[2]}' in source code file ${depToolFilePath}.`,
                                                                Object.assign({}, baseErrorOptions, {
                                                                    dependencyNamespace: segments[0],
                                                                    dependencyTool: segments[1],
                                                                    dependencyExport: segments[2]
                                                                } as DependencyImportError.ErrorOptions)
                                                            );
                                                        }
                                                    }
                                                    else {
                                                        throw new DependencyImportError(
                                                            `Cannot import '${segments[2]}' from Tool '${segments[1]}' in Namespace '${segments[0]}' as a ${depType} Dependency in ${file.name}: '${segments[2]}' is a global that should not need to be imported.`,
                                                            Object.assign({}, baseErrorOptions, {
                                                                dependencyNamespace: segments[0],
                                                                dependencyTool: segments[1],
                                                                dependencyExport: segments[2]
                                                            } as DependencyImportError.ErrorOptions)
                                                        );
                                                    }

                                                }
                                                else {
                                                    throw new DependencyImportError(
                                                        `Unknown Export '${segments[2]}' from Tool '${segments[1]}' in Namespace '${segments[0]}' specified as a ${depType} Dependency in ${file.name}.`,
                                                        Object.assign({}, baseErrorOptions, {
                                                            dependencyNamespace: segments[0],
                                                            dependencyTool: segments[1],
                                                            dependencyExport: segments[2]
                                                        } as DependencyImportError.ErrorOptions)
                                                    );
                                                }
                                            }
                                            else {
                                                throw new DependencyImportError(
                                                    `Unknown Tool '${segments[1]}' in Namespace '${segments[0]}' specified as a ${depType} Dependency in ${file.name}.`,
                                                    Object.assign({}, baseErrorOptions, {
                                                        dependencyNamespace: segments[0],
                                                        dependencyTool: segments[1]
                                                    } as DependencyImportError.ErrorOptions)
                                                );
                                            }
                                        }
                                        else {
                                            throw new DependencyImportError(
                                                `Unknown Namespace '${segments[0]}' specified as a ${depType} Dependency in ${file.name}.`,
                                                Object.assign({}, baseErrorOptions, {
                                                    dependencyNamespace: segments[0]
                                                } as DependencyImportError.ErrorOptions)
                                            );
                                        }

                                    }
                                );

                                recordChanges(destFilePath, fileContents);
                            }

                        });
                    }

                });
            }
        }
    }

};


/* Main Script */

(() => {

    /** A map of {@link ScriptActionOptions} to their respective {@link ScriptActionFunction}. */
    const ACTIONS_MAP = {
        verifySchema: verifySchema,
        updatePackageExports: updatePackageExports,
        updateIssueTemplates: updateIssueTemplates,
        updateReadmeFiles: updateReadmeFiles,
        updateDependencyImports: updateDependencyImports
    } as const satisfies Record<keyof ScriptActionOptions, ScriptActionFunction>;

    /** The Command-Line Options passed to the program. */
    const programArgs = process.argv.slice(2);

    // Check for /?, --usage, or --help in any position
    for (let i = 0; i < programArgs.length; i++) {
        if (['/?', '--usage', '--help'].includes(programArgs[i].toLowerCase())) {
            console.log("Usage: process-toolkit-schema [/? | --usage | --help]");
            console.log("                              [--dry-run]");
            console.log("                              [[-v | --verify-schema] | [-V | --skip-schema-verification]]");
            console.log("                              [[-e | --update-package-exports] | [-E | --skip-package-exports]]");
            console.log("                              [[-i | --update-issue-templates] | [-I | --skip-issue-templates]]");
            console.log("                              [[-r | --update-readme-files] | [-R | --skip-readme-files]]");
            console.log("                              [[-d | --update-dependency-imports] | [-D | --skip-dependency-imports]]");
            console.log();
            console.log("A helper script used to validate and update various project and toolkit files based on the Toolkit Schema (toolkit/schema.json).");
            console.log();
            console.log();
            console.log("Options:");
            console.log();
            console.log("       /?, --usage, --help:           Show this usage message");
            console.log("       --dry-run:                     Show what changes would be made");
            console.log();
            console.log("   -v, --verify-schema,");
            console.log("   -V, --skip-schema-verification:    Verify / Skip Verifying the Toolkit Schema");
            console.log();
            console.log("   -e, --update-package-exports,");
            console.log("   -E, --skip-package-exports:        Update / Skip Updating the package.json file");
            console.log();
            console.log("   -i, --update-issue-templates,");
            console.log("   -I, --skip-issue-templates:        Update / Skip Updating GitHub Issue Templates");
            console.log();
            console.log("   -r, --update-readme-files,");
            console.log("   -R, --skip-readme-files:           Update / Skip Updating Readme Files");
            console.log();
            console.log("   -d, --update-dependency-imports,");
            console.log("   -D, --skip-dependency-imports:     Update / Skip Updating Toolkit Dependency Imports");
            return;
        }
    }


    /* Determine the Program Options and fetch the Toolkit Schema */

    /**
     * The program options determined by
     * the specified Command-Line Options.
     */
    const options: ScriptOptions = (() => {

        /** The program options being determined. */
        let options: ScriptOptions = {
            dryRun: false,
            verifySchema: true,
            updatePackageExports: true,
            updateIssueTemplates: true,
            updateReadmeFiles: true,
            updateDependencyImports: true
        };
        /**
         * Indicates whether or not the *Determinant Argument*
         * has been processed yet.
         * 
         * The *Determinant Argument* refers to the first switch
         * or flag corresponding to one of the {@link ScriptActionOptions}
         * that is used to determine the initial configuration
         * of the returned `options`.
         */
        let processedDeterminantArg: boolean = false;
        
        /**
         * Test if the specified command-line argument is used
         * to *skip* one of the {@link ScriptActionFunction Script Actions}.
         * 
         * @param arg   The command-line argument being tested.
         * 
         * @returns     `true` if `arg` is a command-line argument used to
         *              *skip* one of the {@link ScriptActionFunction Script Actions}
         *              or `false` if it is not.
         */
        const isSkipArg = ( arg: string ): boolean => /(?:\-[a-z])|(?:\-{2}skip-)/.test(arg);
        /**
         * Process the specified command-line argument.
         * 
         * @param arg   The command-line argument being processed.
         */
        const processArg = ( arg: string ) => {

            /** The lowercased-variant of `arg`. */
            const lcArg = arg.toLowerCase();
            /** Indicates whether or not `arg` is a recognized command-line argument. */
            let isValidArg: boolean = true;

            switch (lcArg) {

                case '--dry-run':
                    options.dryRun = true;
                    break;

                case '-v':
                case '--verify-schema':
                case '--skip-schema-verification':
                    options.verifySchema = (arg == '-v' || lcArg == '--verify-schema');
                    break;

                case '-e':
                case '--update-package-exports':
                case '--skip-package-exports':
                    options.updatePackageExports = (arg == '-e' || lcArg == '--update-package-exports');
                    break;
                
                case '-i':
                case '--update-issue-templates':
                case '--skip-issue-templates':
                    options.updateIssueTemplates = (arg == '-i' || lcArg == '--update-issue-templates');
                    break;

                case '-r':
                case '--update-readme-files':
                case '--skip-readme-files':
                    options.updateReadmeFiles = (arg == '-r' || lcArg == '--update-readme-files');
                    break;

                case '-d':
                case '--update-dependency-imports':
                case '--skip-dependency-imports':
                    options.updateDependencyImports = (arg == '-d' || lcArg == '--update-dependency-imports');
                    break;

                default:
                    isValidArg = false;
                    break;

            }

            if (isValidArg) {
                if (!processedDeterminantArg && lcArg != '--dry-run') {
                    processedDeterminantArg = true;

                    // If the Determinant Argument is a *Skip Argument*,
                    // `options` needs to start with all actions set
                    // to `false` by default.
                    if (isSkipArg(arg)) {
                        options.verifySchema = false;
                        options.updatePackageExports = false;
                        options.updateIssueTemplates = false;
                        options.updateReadmeFiles = false;
                        options.updateDependencyImports = false;

                        // Since we're resetting the `options` object,
                        // we need to re-process the current argument.
                        processArg(arg);
                    }
                }
            }
            else {
                console.error(`Unrecogized ${/\^-[a-zA-Z]$/.test(arg) ? 'Switch' : 'Option'}: ${arg}`);
            }

        };

        programArgs.forEach(processArg);
        return options;

    })();
    /** The {@link ToolkitSchema Parsed TypeScript Toolkit Schema}. */
    const schema: ToolkitSchema = fetchToolkitSchema();
    

    /* Perform the specified actions */

    for (const action in ACTIONS_MAP)
        if (options[action])
            ACTIONS_MAP[action as keyof typeof ACTIONS_MAP](schema, options.dryRun);

    if (Object.keys(changes).length > 0)
        commitChanges(options.dryRun);
    else
        console.log("No changes were made to any files.");

})();