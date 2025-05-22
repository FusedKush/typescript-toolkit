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


/* Constants & Program Arguments */

const DRY_RUN = (process.argv.includes('-d') || process.argv.includes('--dry-run'));


/* Helper Functions */

const readFile = ( filepath: string ): string => readFileSync(filepath, { encoding: 'utf-8' });
const readJsonFile = <T extends Record<string, any>> ( filepath: JsonFilePath ): T => JSON.parse(readFile(filepath));
const readYamlFile = <T extends Record<string, any>> ( filepath: YamlFilePath ): T => YAML.parse(readFile(filepath));

function fetchToolkitSchema (): ToolkitSchema {

    try {
        return readJsonFile('./toolkit/schema.json');
    }
    catch (error) {
        throw new Error(
            `Failed to retrieve the TypeScript Toolkit Schema: ${(error as Error).message}`,
            { cause: error }
        );
    }

}

function updatePackageExports ( schema: ToolkitSchema ): void {

    interface PackageConfig {
        [x: string]: any;
        exports: {
            ".": "./dist/index.js",
            [x: `${string}/${string}`]: `./dist/${string}/index.js`
        }
    }

    const PACKAGE_JSON_PATH = "./package.json";

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

        if (!DRY_RUN) {
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
function updateIssueTemplates ( schema: ToolkitSchema ): void {

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

    const ISSUE_TEMPLATE_DIRECTORY_PATH = "./.github/ISSUE_TEMPLATE";
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

        if (!DRY_RUN) {
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

        if (!DRY_RUN) {
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
function updateReadmeFiles ( schema: ToolkitSchema ): void {

    const TOOLKIT_README_PATH = "./toolkit/README.md";

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

        if (!DRY_RUN) {
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
            const readmePath = `./toolkit/${namespaceName}/README.md`;
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

            if (!DRY_RUN) {
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
                    const readmePath = `./toolkit/${fullToolName}/README.md`;
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
        
                    if (!DRY_RUN) {
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

    if (process.argv.includes('--usage') || process.argv.includes('--help')) {
        console.log("Usage: process-toolkit-schema [-d | --dry-run]");
        console.log("                              [--usage | --help]");
        console.log();
        console.log("A helper script used to validate and update various project and toolkit files based on the Toolkit Schema (toolkit/schema.json).");
        console.log();
        console.log();
        console.log("Options:");
        console.log("   -d, --dry-run:     Show what changes would be made");
        console.log("   --usage, --help:   Show this usage message");
        return;
    }

    const schema = fetchToolkitSchema();
    
    updatePackageExports(schema);
    updateIssueTemplates(schema);
    updateReadmeFiles(schema);

})();