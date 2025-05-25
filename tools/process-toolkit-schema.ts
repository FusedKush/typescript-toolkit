import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";


/* Helper Types & Interfaces */

type JsonFilePath = `${string}.json${'' | 'c'}`;
type YamlFilePath = `${string}.y${'a' | ''}ml`;

type ToolkitExportType = 'type' | 'function' | 'constant' | 'variable' | 'global';
type ScriptActionFunction = ( schema: ToolkitSchema, dryRun: boolean ) => void;

interface ToolkitSchema {
    [Namespace: string]: {
        description?: string;
        markdownDescription?: string;
        tools: {
            [Tool: string]: {
                description?: string;
                markdownDescription?: string;
                exports: {
                    [Export: string]: {
                        type: ToolkitExportType;
                        description?: string;
                        markdownDescription?: string;
                    }
                },
                dependencies?: string[]
            }
        }
    }
}

interface ScriptOptions {

    dryRun: boolean;

    verifySchema: boolean;
    updatePackageExports: boolean;
    updateIssueTemplates: boolean;
    updateReadmeFiles: boolean;
    updateDependencyImports: boolean;

};
type ScriptActionOptions = Omit<ScriptOptions, 'dryRun'>;

class SchemaValidationError extends Error implements SchemaValidationError.ValidationDetails {

    readonly namespace?: string;
    readonly tool?: string;

    readonly schemaSyntaxError?: boolean;
    readonly directoryValidationError?: boolean;


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

    export interface ValidationDetails {

        namespace?: string;
        tool?: string;

        schemaSyntaxError?: boolean;
        directoryValidationError?: boolean;

    }

    export interface ErrorOptions extends globalThis.ErrorOptions, ValidationDetails {}

}

enum DependencyType {

    BUNDLED = 'Bundled',
    INLINED = 'Inlined'

};
class DependencyImportError extends Error implements DependencyImportError.ImportDetails {

    readonly fileName?: string;
    readonly filePath?: string;
        
    readonly dependency?: string;
    readonly dependencyType?: DependencyType;
    readonly dependencyNamespace?: string;
    readonly dependencyTool?: string;
    readonly dependencyExport?: string;


    constructor ( message?: string | null, options?: DependencyImportError.ErrorOptions ) {

        super(
            message ?? (
                `Failed to import${options?.dependencyType ? ` ${options.dependencyType}` : ''} TypeScript Toolkit Dependency`
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
            this.dependency = options.dependency;
            this.dependencyType = options.dependencyType;
            this.dependencyNamespace = options.dependencyNamespace;
            this.dependencyTool = options.dependencyTool;
            this.dependencyExport = options.dependencyExport;
            
            if (options.filePath)
                this.filePath = path.resolve('./', options.filePath);
        }
    
    }

}
namespace DependencyImportError {

    export interface ImportDetails {

        fileName?: string;
        filePath?: string;
        
        dependency?: string;
        dependencyType?: DependencyType;
        dependencyNamespace?: string;
        dependencyTool?: string;
        dependencyExport?: string;

    }

    export interface ErrorOptions extends globalThis.ErrorOptions, ImportDetails {}

}


/* Constants & Program Arguments */

const ROOT_PATH = "..";


/* Helper Functions */

const readFile = ( filepath: string ): string => readFileSync(filepath, { encoding: 'utf-8' });
const readJsonFile = <T extends Record<string, any>> ( filepath: JsonFilePath ): T => JSON.parse(readFile(filepath));
const readYamlFile = <T extends Record<string, any>> ( filepath: YamlFilePath ): T => YAML.parse(readFile(filepath));
const stringifyYaml = ( data: YAML.Document ): string => data.toString({ lineWidth: 0 });

function fetchToolkitSchema (): ToolkitSchema {

    try {
        let schema = readJsonFile(`${ROOT_PATH}/toolkit/schema.json`);
        let keys = Object.keys(schema);
        
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

const verifySchema: ScriptActionFunction = (schema, dryRun) => {

    try {
        for (const namespaceName in schema) {
            const namespace = schema[namespaceName];
            
            if (!existsSync(`${ROOT_PATH}/toolkit/${namespaceName}`)) {
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
                        else if ( !(segments[1] in schema[segments[0]].tools) ) {
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
    
                if (!existsSync(`${ROOT_PATH}/toolkit/${fullToolName}`)) {
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
        if (dryRun && error instanceof SchemaValidationError) {
            console.error(error);
        }
        else {
            throw error;
        }
    }

};
const updatePackageExports: ScriptActionFunction = (schema, dryRun) => {

    interface PackageConfig {
        [x: string]: any;
        exports: {
            ".": "./dist/index.js",
            [x: `${string}/${string}`]: `./dist/${string}/index.js`
        }
    }

    const PACKAGE_JSON_PATH = `${ROOT_PATH}/package.json`;

    const getDistFilePath = ( ...segments: string[] ) => `./dist/${segments.join('/')}/index.js` as const;

    try {
        let packageConfig: PackageConfig = readJsonFile(PACKAGE_JSON_PATH);

        packageConfig.exports = { ".": "./dist/index.js" };

        for (const namespace in schema) {
            packageConfig['exports'][`./${namespace}`] = getDistFilePath(namespace);
            
            for (const tool in schema[namespace].tools) {
                packageConfig['exports'][`./${namespace}/${tool}`] = getDistFilePath(namespace, tool);
            }
        }

        if (!dryRun) {
            writeFileSync(PACKAGE_JSON_PATH, `${JSON.stringify(packageConfig, null, 2)}\n`);
            console.log(`[+] Updated package.json.`);
        }
        else {
            console.log(`\nUpdated package.json:`);
            console.log(`\t${JSON.stringify(packageConfig, null, 2).replaceAll('\n', '\n\t')}`);
        }
    }
    catch (error) {
        throw new Error(
            `Failed to update the NPM Package Exports: ${(error as Error).message}`,
            { cause: error }
        );
    }

};
const updateIssueTemplates: ScriptActionFunction = (schema, dryRun) => {

    interface ToolkitToolIssueReport {
        [x: string]: any;
        body: [
            object,
            object,
            {
                type: 'dropdown';
                id: 'tools';
                attributes: {
                    label: string;
                    description: string;
                    multiple: true;
                    options: `${string}/${string}`[]
                }
            }
        ]
    }
    interface RequestsAndSuggestions {
        [x: string]: any;
        body: [
            object,
            object,
            {
                type: 'dropdown';
                id: 'type';
                attributes: {
                    label: string;
                    description: string;
                    multiple: true;
                    options: string[]
                }
            }
        ]
    }

    const ISSUE_TEMPLATE_DIRECTORY_PATH = `${ROOT_PATH}/.github/ISSUE_TEMPLATE`;
    const TOOLKIT_TOOL_ISSUE_REPORT_PATH = `${ISSUE_TEMPLATE_DIRECTORY_PATH}/1-toolkit-tool-issue.yml`;
    const REQUESTS_AND_SUGGESTIONS_PATH = `${ISSUE_TEMPLATE_DIRECTORY_PATH}/3-requests-and-suggestions.yml`;

    
    /* Update Toolkit Tool Issue Report Issue Template */
    
    try {
        // let toolkitToolIssueReport: ToolkitToolIssueReport = readYamlFile(TOOLKIT_TOOL_ISSUE_REPORT_PATH);
        // let toolList = toolkitToolIssueReport.body[2].attributes.options;
        let yamlDoc = YAML.parseDocument(readFile(TOOLKIT_TOOL_ISSUE_REPORT_PATH));
        let toolList = (
            (
                (
                    (yamlDoc.get('body') as YAML.YAMLSeq).items[2] as YAML.YAMLMap
                ).get('attributes') as YAML.YAMLMap
            ).get('options') as YAML.YAMLSeq
        ).items as string[];

        (yamlDoc.get('labels') as YAML.YAMLSeq).flow = true;
        toolList.length = 0;

        for (const namespace in schema) {
            const tools = schema[namespace].tools;

            for (const tool in tools) {
                const exportList = tools[tool].exports;

                toolList.push(`\`${namespace}/${tool}\``);

                for (const exportName in exportList) {
                    toolList.push(`  - \`${namespace}/${exportName}${exportList[exportName].type == 'function' ? '()' : ''}\``);
                }
            }
        }

        if (!dryRun) {
            writeFileSync(TOOLKIT_TOOL_ISSUE_REPORT_PATH, stringifyYaml(yamlDoc));
            console.log(`[+] Updated the 'Toolkit Tool Issue Report' GitHub Issue Template.`);
        }
        else {
            console.log(`Updated the 'Toolkit Tool Issue Report' GitHub Issue Template:`);
            console.log(`\t${stringifyYaml(yamlDoc).replaceAll('\n', '\n\t')}`);
        }
    }
    catch (error) {
        throw new Error(
            `Failed to update the "Toolkit Tool Issue Report" Issue Template: ${(error as Error).message}`,
            { cause: error }
        );
    }


    /* Update Requests and Suggestions Issue Template */

    try {
        // let requestsAndSuggestions: RequestsAndSuggestions = readYamlFile(REQUESTS_AND_SUGGESTIONS_PATH);
        // let toolList = requestsAndSuggestions.body[2].attributes.options;
        let yamlDoc = YAML.parseDocument(readFile(REQUESTS_AND_SUGGESTIONS_PATH));
        let toolList = (
            (
                (
                    (yamlDoc.get('body') as YAML.YAMLSeq).items[2] as YAML.YAMLMap
                ).get('attributes') as YAML.YAMLMap
            ).get('options') as YAML.YAMLSeq
        ).items as string[];

        (yamlDoc.get('labels') as YAML.YAMLSeq).flow = true;
        toolList.length = 0;
        toolList.push("Toolkit Namespaces");

        for (const namespace in schema) {
            toolList.push(`  - \`${namespace}\``);
        }

        toolList.push('Toolkit Tools');

        for (const namespace in schema) {
            const tools = schema[namespace].tools;

            for (const tool in tools) {
                const exportList = tools[tool].exports;

                toolList.push(`  - \`${namespace}/${tool}\``);

                for (const exportName in exportList) {
                    toolList.push(`    + \`${namespace}/${exportName}${exportList[exportName].type == 'function' ? '()' : ''}\``);
                }
            }
        }

        toolList.push(
            "Project Documentation",
            "API Documentation Wiki",
            "Project Layout, Organization, or Architecture",
            "Code Snippet Usage",
            "NPM Package Installation, Deployment, or Usage",
            "Contributing",
            "Other"
        );

        if (!dryRun) {
            writeFileSync(REQUESTS_AND_SUGGESTIONS_PATH, stringifyYaml(yamlDoc));
            console.log(`[+] Updated the 'Feature Request or Suggestion' GitHub Issue Template.`);
        }
        else {
            console.log(`\nUpdated the 'Feature Request or Suggestion' GitHub Issue Template:`);
            console.log(`\t${stringifyYaml(yamlDoc).replaceAll('\n', '\n\t')}`);
        }
    }
    catch (error) {
        throw new Error(
            `Failed to update the "Feature Request or Suggestion" Issue Template: ${(error as Error).message}`,
            { cause: error }
        );
    }

};
const updateReadmeFiles: ScriptActionFunction = (schema, dryRun) => {

    const TOOLKIT_README_PATH = `${ROOT_PATH}/toolkit/README.md`;

    let dependencies: Record<string, string[]> = {};


    /* Update Main Toolkit Readme */

    try {
        let readmeContents = readFile(TOOLKIT_README_PATH);
        
        readmeContents = readmeContents.replace(
            new RegExp('(## Namespaces)[^#]+', 'm'),
            (match, p1) => {

                let namespaces = p1;

                for (const namespaceName in schema) {
                    const namespace = schema[namespaceName];

                    namespaces += `\n- [\`${namespaceName}\`](${namespaceName}): ${namespace.markdownDescription ?? namespace.description}`;
                }

                return namespaces;

            }
        );

        if (!dryRun) {
            writeFileSync(TOOLKIT_README_PATH, readmeContents);
            console.log("[+] Updated Main Toolkit Readme.");
        }
        else {
            console.log("\nUpdated Main Toolkit Readme:");
            console.log(`\t${readmeContents.replaceAll('\n', '\n\t')}`);
        }
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
            const readmePath = `${ROOT_PATH}/toolkit/${namespaceName}/README.md`;
            let readmeContents = readFile(readmePath);
            
            readmeContents = readmeContents.replace(
                new RegExp('(## Tool List)[^#]+', 'm'),
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

                    return toolList;

                }
            );

            if (!dryRun) {
                writeFileSync(TOOLKIT_README_PATH, readmeContents);
                console.log(`[+] Updated Readme for Namespace '${namespaceName}'.`);

            }
            else {
                console.log(`\nUpdated Readme for Namespace '${namespaceName}':`);
                console.log(`\t${readmeContents.replaceAll('\n', '\n\t')}`);
            }
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
                    const readmePath = `${ROOT_PATH}/toolkit/${fullToolName}/README.md`;
                    let readmeContents = readFile(readmePath);
                    
                    if (tool.dependencies && tool.dependencies.length > 0) {
                        readmeContents = readmeContents.replace(
                            new RegExp('(- \\*\\*Depends On\\*\\*:).+(?=\n- \\*\\*Dependents)', 'ms'),
                            (match, p1) => {
            
                                let dependencyList = p1;
    
                                (tool.dependencies as string[]).forEach((dependency) => {
    
                                    dependencyList += `\n  - [\`${dependency}\`](${path.posix.relative(`toolkit/${fullToolName}`, `toolkit/${dependency}`)})`;
    
                                });
            
                                return dependencyList;
            
                            }
                        );
                    }
                    if (fullToolName in dependencies) {
                        readmeContents = readmeContents.replace(
                            new RegExp('(- \\*\\*Dependents\\*\\*:)[^#]+', 'm'),
                            (match, p1) => {
            
                                let dependentList = p1;

                                dependencies[fullToolName].forEach((dependent) => {

                                    dependentList += `\n  - [\`${dependent}\`](${path.posix.relative(`toolkit/${fullToolName}`, `toolkit/${dependent}`)})`;

                                });
            
                                return `${dependentList}\n\n`;
            
                            }
                        );
                    }
        
                    if (!dryRun) {
                        writeFileSync(TOOLKIT_README_PATH, readmeContents);
                        console.log(`[+] Updated Readme for Tool '${fullToolName}'.`);
        
                    }
                    else {
                        console.log(`\nUpdated Readme for Tool '${fullToolName}':`);
                        console.log(`\t${readmeContents.replaceAll('\n', '\n\t')}`);
                    }
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
const updateDependencyImports: ScriptActionFunction = (schema, dryRun) => {

    const DEPENDENCY_IMPORT_REGEX = /( *)(?:(?:\/{3} @(bundle|inline)Dependency ([a-zA-Z0-9.]+))|(?:\/\* @(bundle|inline)Dependency ([a-zA-Z0-9.]+) \*\/))/g;
    const BASE_CODE_REGEX = "\\/\\*{2}(?:[^*]|\\*(?!\\/))+\\*\\/\\s+";

    for (const namespaceName in schema) {
        const namespace = schema[namespaceName];

        for (const toolName in namespace.tools) {
            const tool = namespace.tools[toolName];
            const fullToolName = `${namespaceName}/${toolName}`;

            if (tool.dependencies && tool.dependencies.length > 0) {
                (['ts', 'js'] as const).forEach((scriptType) => {

                    const scriptsPath = `${ROOT_PATH}/toolkit/${fullToolName}/${scriptType}`;
                    const srcPath = `${scriptsPath}/src`;
    
                    if (existsSync(srcPath)) {
                        const files = readdirSync(srcPath, { withFileTypes: true });
    
                        files.forEach((file) => {

                            if (file.isFile()) {
                                let filePath = `${srcPath}/${file.name}`;
                                let fileContents = readFile(filePath);
                                    
                                fileContents = fileContents.replaceAll(
                                    DEPENDENCY_IMPORT_REGEX,
                                    (match, p1, p2, p3, p4, p5) => {

                                        let branch: 'left' | 'right' = (p2 === undefined ? 'right' : 'left');
                                        let indent: string = p1;
                                        let depTag: 'bundle' | 'inline' = (branch == 'left' ? p2 : p4);
                                        let depType: DependencyType = (depTag == 'bundle' ? DependencyType.BUNDLED : DependencyType.INLINED);
                                        let dependency: string = (branch == 'left' ? p3 : p5);
                                        let segments: string[] = dependency.split('.');
                                        let baseErrorOptions: DependencyImportError.ErrorOptions = {
                                            fileName: file.name,
                                            filePath: filePath,
                                            dependency: dependency,
                                            dependencyType: depType
                                        };

                                        if (segments.length != 3) {
                                            throw new DependencyImportError(
                                                `An invalid ${depType} Dependency was specified in ${file.name}: ${dependency}`,
                                                baseErrorOptions
                                            );
                                        }

                                        if (segments[0] in schema) {
                                            const depNamespace = schema[segments[0]];

                                            if (segments[1] in depNamespace.tools) {
                                                const depTool = depNamespace.tools[segments[1]];

                                                if (segments[2] in depTool.exports) {
                                                    const depExport = depTool.exports[segments[2]];

                                                    if (depExport.type != 'global') {
                                                        const codeRegex: RegExp = (() => {

                                                            switch (depExport.type) {

                                                                case 'type':
                                                                    return new RegExp(
                                                                        scriptType == 'ts'
                                                                            ? `${BASE_CODE_REGEX}type ${segments[2]}[^=]+=.+?(?:(?:;|\n(?=\n))|$)`
                                                                            : `(?:\\/{2} ${segments[2]}\s+)?\\/\\*{2}(?:[^*]|\\*(?!\\/))+\\@typedef {.+?} ${segments[2]}(?:[^*]|\\*(?!\\/))+\\*\\/`,
                                                                        's'
                                                                    );

                                                                case 'function':
                                                                    return new RegExp(`${BASE_CODE_REGEX}(?:function|const|var|let) ${segments[2]}[^{]+{(?:[^{}]|{.+})+}`, 's');
                                                                
                                                                case 'constant':
                                                                    return new RegExp(`${BASE_CODE_REGEX}const ${segments[2]}[^=]+=.+?(?:(?:;|\n(?=\n))|$`, 's');
                                                                
                                                                case 'variable':
                                                                    return new RegExp(`${BASE_CODE_REGEX}(?:const|var|let) ${segments[2]}[^=]+=.+?(?:(?:;|\n(?=\n))|$`, 's');
                                                            
                                                                }

                                                        })();
                                                        const depToolDirPath = `${ROOT_PATH}/toolkit/${segments[0]}/${segments[1]}/${scriptType}`;
                                                        const depToolFilePath: string = (() => {

                                                            if (existsSync(depToolDirPath)) {
                                                                if (existsSync(`${depToolDirPath}/${file.name}`))
                                                                    return `${depToolDirPath}/${file.name}`;
                                                                else if (existsSync(`${depToolDirPath}/${depTag == 'bundle' ? 'bundled' : 'inlined'}-deps.${scriptType}`))
                                                                    return `${depToolDirPath}/${depTag == 'bundle' ? 'bundled' : 'inlined'}-deps.${scriptType}`;
                                                                else if (existsSync(`${depToolDirPath}/index.${scriptType}`))
                                                                    return `${depToolDirPath}/index.${scriptType}`;
                                                                else
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
                                                        const depToolFileContents = readFile(depToolFilePath);
                                                        const depExportContents = depToolFileContents.match(codeRegex);
                                                        
                                                        if (depExportContents) {
                                                            let replacementString = indent + depExportContents[0].replaceAll('\n', `\n${indent}`);
    
                                                            if (depType == DependencyType.BUNDLED) {
                                                                if (!replacementString.endsWith('\n'))
                                                                    replacementString += '\n';
                                                            }
                                                            else {
                                                                replacementString = `${indent}// Inlined TypeScript Toolkit Dependency\n${replacementString}`;
                                                            }
    
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

                                if (!dryRun) {
                                    writeFileSync(`${scriptsPath}/${file.name}`, fileContents);
                                    console.log(`[+] Processed Bundled and Inlined Dependencies for file ${fullToolName}/${scriptType}/${file.name}.`);
                                }
                                else {
                                    console.log(`\nProcessed Bundled and Inlined Dependencies for file ${fullToolName}/${scriptType}/${file.name}:`);
                                    console.log(`\t${fileContents.replaceAll('\n', '\n\t')}`);
                                }
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
            console.log("Usage: process-toolkit-schema [--dry-run] [--usage | --help]");
            console.log("                              [[-v | --verify-schema] | [-V | --skip-schema-verification]]");
            console.log("                              [[-e | --update-package-exports] | [-E | --skip-package-exports]]");
            console.log("                              [[-i | --update-issue-templates] | [-I | --skip-issue-templates]]");
            console.log("                              [[-r | --update-readme-files] | [-R | --skip-readme-files]]");
            console.log("                              [[-d | --update-dependency-imports] | [-D | --skip-dependency-imports]]");
            console.log();
            console.log("A helper script used to validate and update various project and toolkit files based on the Toolkit Schema (toolkit/schema.json).");
            console.log();
            console.log();
            console.log("Command-Line Arguments:");
            console.log();
            console.log("       --usage, --help:               Show this usage message");
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
     * The program options determined by the specified Command-Line Options.
     */
    const options: ScriptOptions = (() => {

        let options: ScriptOptions = {
            dryRun: false,
            verifySchema: true,
            updatePackageExports: true,
            updateIssueTemplates: true,
            updateReadmeFiles: true,
            updateDependencyImports: true
        };
        let processedDeterminantArg: boolean = false;
        
        const isSkipArg = ( arg: string ): boolean => /(?:\-[a-z])|(?:\-{2}skip-)/.test(arg);
        const cb = (arg) => {

            const lcArg = arg.toLowerCase();
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

                    if (isSkipArg(arg)) {
                        options.verifySchema = false;
                        options.updatePackageExports = false;
                        options.updateIssueTemplates = false;
                        options.updateReadmeFiles = false;
                        options.updateDependencyImports = false;
                        cb(arg);
                    }
                }
            }
            else {
                console.error(`Unrecogized ${/\^-[a-zA-Z]$/.test(arg) ? 'Switch' : 'Option'}: ${arg}`);
            }

        };

        programArgs.forEach(cb);
        
        return options;

    })();
    /**
     * The Parsed TypeScript Toolkit Schema.
     */
    const schema: ToolkitSchema = fetchToolkitSchema();
    let actionsPerformed: number = 0;
    

    /* Perform the specified actions */

    for (const action in ACTIONS_MAP) {
        if (options[action]) {
            ACTIONS_MAP[action as keyof typeof ACTIONS_MAP](schema, options.dryRun);
            actionsPerformed++;
        }
    }

    if (actionsPerformed == 0)
        console.error("No actions were performed!");

})();