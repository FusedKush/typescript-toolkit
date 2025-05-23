import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";


/* Helper Types & Interfaces */

type JsonFilePath = `${string}.json${'' | 'c'}`;
type YamlFilePath = `${string}.y${'a' | ''}ml`;

type ToolkitExportType = 'type' | 'function' | 'constant' | 'variable' | 'global';
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


/* Constants & Program Arguments */

const ROOT_PATH = "..";


/* Helper Functions */

const readFile = ( filepath: string ): string => readFileSync(filepath, { encoding: 'utf-8' });
const readJsonFile = <T extends Record<string, any>> ( filepath: JsonFilePath ): T => JSON.parse(readFile(filepath));
const readYamlFile = <T extends Record<string, any>> ( filepath: YamlFilePath ): T => YAML.parse(readFile(filepath));

function fetchToolkitSchema (): ToolkitSchema {

    try {
        return readJsonFile(`${ROOT_PATH}/toolkit/schema.json`);
    }
    catch (error) {
        throw new Error(
            `Failed to retrieve the TypeScript Toolkit Schema: ${(error as Error).message}`,
            { cause: error }
        );
    }

}

function updatePackageExports ( schema: ToolkitSchema, dryRun: boolean ): void {

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
            if (namespace.startsWith('$'))
                continue;

            packageConfig['exports'][`./${namespace}`] = getDistFilePath(namespace);
            
            for (const tool in schema[namespace].tools) {
                packageConfig['exports'][`./${namespace}/${tool}`] = getDistFilePath(namespace, tool);
            }
        }

        if (!dryRun) {
            writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageConfig, null, 2));
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

}
function updateIssueTemplates ( schema: ToolkitSchema, dryRun: boolean ): void {

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

    const ISSUE_TEMPLATE_DIRECTORY_PATH = "../.github/ISSUE_TEMPLATE";
    const TOOLKIT_TOOL_ISSUE_REPORT_PATH = `${ISSUE_TEMPLATE_DIRECTORY_PATH}/1-toolkit-tool-issue.yml`;
    const REQUESTS_AND_SUGGESTIONS_PATH = `${ISSUE_TEMPLATE_DIRECTORY_PATH}/3-requests-and-suggestions.yml`;

    
    /* Update Toolkit Tool Issue Report Issue Template */
    
    try {
        let toolkitToolIssueReport: ToolkitToolIssueReport = readYamlFile(TOOLKIT_TOOL_ISSUE_REPORT_PATH);
        let toolList = toolkitToolIssueReport.body[2].attributes.options;

        toolList = [];

        for (const namespace in schema) {
            if (namespace.startsWith('$'))
                continue;
            
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
            writeFileSync(REQUESTS_AND_SUGGESTIONS_PATH, YAML.stringify(toolkitToolIssueReport));
            console.log(`[+] Updated the 'Toolkit Tool Issue Report' GitHub Issue Template.`);
        }
        else {
            console.log(`Updated the 'Toolkit Tool Issue Report' GitHub Issue Template:`);
            console.log(`\t${YAML.stringify(toolkitToolIssueReport).replaceAll('\n', '\n\t')}`);
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
        let requestsAndSuggestions: RequestsAndSuggestions = readYamlFile(REQUESTS_AND_SUGGESTIONS_PATH);
        let toolList = requestsAndSuggestions.body[2].attributes.options;

        toolList = ["Toolkit Namespaces"];

        for (const namespace in schema) {
            if (namespace.startsWith('$'))
                continue;

            toolList.push(`  - \`${namespace}\``);
        }

        toolList.push('Toolkit Tools');

        for (const namespace in schema) {
            if (namespace.startsWith('$'))
                continue;
            
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
            writeFileSync(REQUESTS_AND_SUGGESTIONS_PATH, YAML.stringify(requestsAndSuggestions));
            console.log(`[+] Updated the 'Feature Request or Suggestion' GitHub Issue Template.`);
        }
        else {
            console.log(`\nUpdated the 'Feature Request or Suggestion' GitHub Issue Template:`);
            console.log(`\t${YAML.stringify(requestsAndSuggestions).replaceAll('\n', '\n\t')}`);
        }
    }
    catch (error) {
        throw new Error(
            `Failed to update the "Feature Request or Suggestion" Issue Template: ${(error as Error).message}`,
            { cause: error }
        );
    }

}
function updateReadmeFiles ( schema: ToolkitSchema, dryRun: boolean ): void {

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
                    if (namespaceName.startsWith('$'))
                        continue;

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
        if (namespaceName.startsWith('$'))
            continue;

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
        if (namespaceName.startsWith('$'))
            continue;

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

}


/* Main Script */

(() => {

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

        if (!Object.values(options).slice(1).includes(true))
            console.error("No actions were specified!");
        
        return options;

    })();
    /**
     * The Parsed TypeScript Toolkit Schema.
     */
    const schema: ToolkitSchema = fetchToolkitSchema();
    

    /* Perform the specified actions */

    if (options.updatePackageExports)
        updatePackageExports(schema, options.dryRun);
    if (options.updateIssueTemplates)
        updateIssueTemplates(schema, options.dryRun);
    if (options.updateReadmeFiles)
        updateReadmeFiles(schema, options.dryRun);

})();