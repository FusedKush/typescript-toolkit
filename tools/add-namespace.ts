/*
 * An automation tool that can be used to
 * add a new Namespace to the TypeScript Toolkit.
 * 
 * @author Zach Vaughan (FusedKush)
 */

import {
    PACKAGE_VERSION,
    ROOT_PATH,
    TOOLKIT_PATH,
    type ToolkitSchema,
    copyDirectory,
    fetchToolkitSchema,
    processSchema,
    readFile,
    switchToAltBuffer,
    switchToMainBuffer,
    updateToolkitSchema,
    writeFile
} from "./utils.ts";
import { spawnSync } from "node:child_process";
import Readline from "node:readline/promises";
import versionIsLessThan from "semver/functions/lt.js";
import isSemverString from "semver/functions/valid.js";


/* Helper Functions */

/**
 * Create and update the boilerplate files
 * for the new Namespace being added.
 * 
 * @param namespaceName     The name of the new Namespace.
 * 
 * @param namespaceDetails  Details about the new Namespace being added.
 * 
 * @param targetVersion     The target version the new Namespace
 *                          is to be added in.
 * 
 * @param dryRun            Indicates whether or not to print to the console
 *                          what changes would have been made to the various
 *                          files instead of actually making them.
 * 
 * @throws                  An {@link Error} if any of the boilerplate files
 *                          for the new Namespace being added could not be
 *                          successfully added or updated.
 */
function createNamespaceFiles (
    namespaceName: string,
    namespaceDetails: ToolkitSchema[string],
    targetVersion: string,
    dryRun: boolean
): void {

    const TEMPLATE_PATH = `${ROOT_PATH}/templates/namespace`;
    
    let namespacePath = `${TOOLKIT_PATH}/${namespaceName}`;
    let dirPath = (!dryRun ? namespacePath : TEMPLATE_PATH);
    let description: string | undefined = (namespaceDetails.markdownDescription ?? namespaceDetails.description);

    // Copy the boilerplate files from /templates/namespace to /toolkit.
    copyDirectory(TEMPLATE_PATH, namespacePath, dryRun);

    // Update `index.ts`
    writeFile(`${dirPath}/index.ts`, (() => {

        let fileContents = readFile(`${dirPath}/index.ts`);

        if (description)
            fileContents = fileContents.replace("Namespace description goes here...", description);

        fileContents = fileContents.replace('TARGET_VERSION', targetVersion);

        return fileContents;

    })(), { dryRun, trueFilepath: `${namespacePath}/index.ts` });

    // Update `README.md`
    writeFile(`${dirPath}/README.md`, (() => {

        let fileContents = readFile(`${dirPath}/README.md`);

        fileContents = fileContents.replaceAll('NAMESPACE', namespaceName);
        fileContents = fileContents.replaceAll('TARGET_VERSION', targetVersion);

        if (description)
            fileContents = fileContents.replace("Namespace description goes here...", description);

        return fileContents;

    })(), { dryRun, trueFilepath: `${namespacePath}/README.md` });

}


/* Main Script */
(async () => {

    /* Script Variables */

    /** The TypeScript Toolkit Schema being queried and modified. */
    let schema: ToolkitSchema = fetchToolkitSchema();
    /**
     * The {@link Readline.Interface Readline Interface} responsible for
     * prompting the user for input.
     */
    let rl = Readline.createInterface(process.stdin, process.stdout);

    /** The name of the new namespace or `null` if one has not been specified yet. */
    let namespaceName: string | null = null;
    /** Details about the new namespace being added. */
    let namespaceDetails: ToolkitSchema[string] = {};
    /** The target version the new namespace is to be added in. */
    let targetVersion = PACKAGE_VERSION;
    /** Indicates whether or not to prompt the user for details about the new namespace. */
    let interactiveMode: boolean = true;
    /**
     * Indicates whether or not to print out what changes
     * would have been made instead of making them.
     */
    let dryRun: boolean = false;
    /**
     * Indicates whether or not the user has confirmed
     * the entered {@link namespaceName} and {@link namespaceDetails}.
     * 
     * Only used if {@link interactiveMode} is `true`.
     */
    let confirmed: boolean = false;


    /* Helper Functions */

    /**
     * Check if `namespace` is a valid Namespace Name,
     * automatically printing an error message to the console if
     * it is not.
     * 
     * @param namespace     The Namespace Name being tested.
     * 
     * @returns             `true` if `namespace` is a valid namespace name
     *                      or `false` if it is not.
     */
    const isValidNamespace = ( namespace: string ): boolean => {

        if ( !/^[a-zA-Z0-9]+$/.test(namespace) ) {
            console.error("Namespaces can only contain alphanumeric characters.");
            return false;
        }
        else if (namespace in schema) {
            console.error(`The namespace '${namespace}' already exists!`);
            return false;
        }

        return true;

    };
    /**
     * Check if `version` is a valid Target Version Number `string`,
     * automatically printing an error message to the console if
     * it is not.
     * 
     * @param namespace     The version `string` being tested.
     * 
     * @returns             `true` if `version` is a valid Target Version Number `string`
     *                      or `false` if it is not.
     */
    const isValidVersion = ( version: string ): boolean => {

        if (!isSemverString(version)) {
            console.log(`'${version}' is not a valid semver version number.`);
            return false;
        }
        else if (versionIsLessThan(version, PACKAGE_VERSION)) {
            console.log(`The target version cannot be less than the Package Version (Package is ${PACKAGE_VERSION} but ${version} was specified.)`);
            return false;
        }

        return true;

    };

    /**
     * Prompt the user for the {@link namespaceName name}
     * of the new Namespace being added.
     * 
     * @returns     A promise that is fulfilled once the user has specified
     *              a valid value for the {@link namespaceName}.
     */
    const promptForName = async () => {
        
        await switchToAltBuffer();
        console.log("Please enter the name of the new namespace");
        console.log();

        // Continue re-prompting the user until a valid
        // Namespace Name has been provided.
        do {
            const response = await rl.question("Namespace Name: ");

            if (response && response.trim().length > 0)
                namespaceName = response;    
        } while (!namespaceName || !isValidNamespace(namespaceName));
        
        await switchToMainBuffer();

    };
    /**
     * Prompt the user for the {@link namespaceDetails.description description}
     * of the new Namespace being added.
     * 
     * @returns     A promise that is fulfilled once the user has specified a valid value
     *              for the {@link namespaceDetails.description namespace description} or
     *              declined to do so.
     */
    const promptForDescription = async () => {

        await switchToAltBuffer();
        console.log("Do you want to add a description for the new namespace?");
        console.log();
        console.log("Enter the namespace description or press enter to continue.");
        console.log();

        const response = await rl.question("Description: ");

        if (response && response.trim().length > 0)
            namespaceDetails.description = response;

        await switchToMainBuffer();

    };
    /**
     * Prompt the user for the {@link namespaceDetails.markdownDescription markdown description}
     * of the new Namespace being added.
     * 
     * @returns     A promise that is fulfilled once the user has specified a valid value
     *              for the {@link namespaceDetails.markdownDescription namespace markdown description}
     *              or declined to do so.
     */
    const promptForMarkdownDescription = async () => {

        await switchToAltBuffer();
        console.log("Do you want to add a markdown description for the new namespace?");
        console.log();
        console.log("Enter the namespace markdown description or press enter to continue.");
        console.log();

        const response = await rl.question("Markdown Description: ");

        if (response && response.trim().length > 0)
            namespaceDetails.markdownDescription = response;

        await switchToMainBuffer();

    };
    /**
     * Prompt the user for the {@link targetVersion Target Version}
     * of the new Namespace being added.
     * 
     * @returns     A promise that is fulfilled once the user has specified a valid value
     *              for the {@link targetVersion namespace target version} or
     *              decided to use the current {@link PACKAGE_VERSION} instead.
     */
    const promptForTargetVersion = async () => {

        await switchToAltBuffer();
        console.log("What is the target version of the namespace?");
        console.log("Current Value:", targetVersion);
        console.log();
        console.log("Enter a new target version or press enter to continue.");
        console.log();

        const prompt = async () => {

            const response = await rl.question("Target Version: ");
    
            if (response && response.trim().length > 0) {
                if (isValidVersion(response)) {
                    targetVersion = response;
                    await switchToMainBuffer();
                }
                else {
                    await prompt();
                }
            }
            
            console.log();

        };

        await prompt();

    };


    /* Main Script */

    try {
        // Process the command-line arguments
        for (let i = 2; i < process.argv.length; i++) {
            const arg: string = process.argv[i];
            const lcArg: string = arg.toLowerCase();
            const nextArg: string | undefined = process.argv[i + 1];
    
            if (arg == '-n' || lcArg == '--namespace') {
                if (nextArg !== undefined && nextArg.length > 0) {
                    namespaceName = process.argv[i + 1];
                    interactiveMode = false;
                    i++;
                }
                else {
                    console.error(`The ${arg} option must be followed by the name of the new namespace.`);
                }
            }
            else if (arg == '-d' || lcArg == '--description') {
                if (nextArg !== undefined && nextArg.length > 0) {
                    namespaceDetails.description = process.argv[i + 1];
                    i++;
                }
                else {
                    console.error(`The ${arg} option must be followed by the description of the new namespace.`);
                }
            }
            else if (arg == '-m' || lcArg == '--markdown-description') {
                if (nextArg !== undefined && nextArg.length > 0) {
                    namespaceDetails.markdownDescription = process.argv[i + 1];
                    i++;
                }
                else {
                    console.error(`The ${arg} option must be followed by the markdown description of the new namespace.`);
                }
            }
            else if (arg == '-t' || lcArg == '--target-version') {
                if (nextArg !== undefined && nextArg.length > 0) {
                    targetVersion = process.argv[i + 1];
                    i++;
                }
                else {
                    console.error(`The ${arg} option must be followed by the target version of the new namespace.`);
                }
            }
            else if (lcArg == '--dry-run') {
                dryRun = true;
            }
            else if (['/?', '--usage', '--help'].includes(lcArg)) {
                console.log("Usage: add-namespace [/? | --usage | --help]");
                console.log("                     [--dry-run]")
                console.log("                     [[-n | --namespace] <Namespace>]");
                console.log("                     [[-d | --description] <Description>]");
                console.log("                     [[-m | --markdown-description] <Markdown Description>]");
                console.log("                     [[-t | --target-version] <Target Version>]");
                console.log();
                console.log("A helper script used to add a new Namespace to the TypeScript Toolkit.");
                console.log();
                console.log();
                console.log("Command-Line Arguments:");
                console.log();
                console.log("       /?, --usage, --help:        Show this usage message");
                console.log("       --dry-run:                  Show what changes would be made");
                console.log();
                console.log("   -n, --namespace:                The name of the new namespace to add.");
                console.log("   -d, --description:              The description of the new namespace.");
                console.log("   -m, --markdown-description:     The markdown description of the new namespace.");
                console.log("   -t, --target-version:           The target version the new namespace is to be added in.");
                return;
            }
            else {
                console.log(`Unrecognized command-line option: ${arg}`);
            }
        }
    
        // If the script is in Interactive Mode, we need to
        // prompt the user for details about the new Namespace being added.
        if (interactiveMode) {
            await promptForName();

            if (!namespaceDetails.description)
                await promptForDescription();
            if (!namespaceDetails.markdownDescription)
                await promptForMarkdownDescription();
            if (targetVersion == PACKAGE_VERSION)
                await promptForTargetVersion();
            
            while (!confirmed) {
                /** The user's response to the confirmation prompt. */
                let response: string = "";

                await switchToAltBuffer();
                console.log("Does everything look right?");
                console.log({
                    name: namespaceName,
                    description: namespaceDetails.description,
                    markdownDescription: namespaceDetails.markdownDescription,
                    targetVersion: targetVersion
                });
        
                // Continue re-prompting the user until a valid response is provided.
                while ( !['yes', 'y', 'no', 'n'].includes(response) )
                    response = (await rl.question("(Y)es/(N)o: ")).toLowerCase();

                await switchToMainBuffer();
        
                // Once confirmed, we can simply exit the confirmation loop.
                if (response.startsWith('y')) {
                    confirmed = true;
                }
                // If unconfirmed, we want to re-prompt the user
                // for all of the details about the new Namespace.
                else {
                    await promptForName();
                    await promptForDescription();
                    await promptForMarkdownDescription();
                    await promptForTargetVersion();
                }
            }
        }
        // If the Namespace Name or Target Version specified via the command-line
        // is invalid, the script should terminate immediately
        // after the error message is printed by `isValidNamespace()`.
        else if ( !isValidNamespace(namespaceName!) || !isValidVersion(targetVersion) ) {
            return;
        }
        
        // Update the Toolkit Schema to add the new Namespace.
        schema[namespaceName!] = namespaceDetails;
        schema = (() => {

            let newObj = {};

            Object.keys(schema).sort().forEach(
                (key) => (newObj[key] = schema[key])
            );

            return newObj;

        })();

        updateToolkitSchema(schema, dryRun, 'add-namespace');

        // Add and update the boilerplate files for the new namespace.
        createNamespaceFiles(namespaceName!, namespaceDetails, targetVersion, dryRun);
    
        if (!dryRun) {
            if (processSchema('--skip-dependency-imports'))
                console.log(`\nSuccessfully added namespace '${namespaceName!}'!`);
        }
    }
    catch (error) {
        throw error;
    }
    finally {
        rl.close();
    }

})();