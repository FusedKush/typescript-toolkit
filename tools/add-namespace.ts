/*
 * An automation tool that can be used to
 * add a new Namespace to the TypeScript Toolkit.
 * 
 * @author Zach Vaughan (FusedKush)
 */

import {
    type ToolkitSchema,
    fetchToolkitSchema,
    updateToolkitSchema
} from "./utils.ts";
import { spawnSync } from "node:child_process";
import Readline from "node:readline/promises";


// Main Script
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
     * Prompt the user for the {@link namespaceName name}
     * of the new Namespace being added.
     * 
     * @returns     A promise that is fulfilled once the user has specified
     *              a valid value for the {@link namespaceName}.
     */
    const promptForName = async () => {
        
        console.log("Please enter the name of the new namespace");
        console.log();

        // Continue re-prompting the user until a valid
        // Namespace Name has been provided.
        do {
            const response = await rl.question("Namespace Name: ");

            if (response && response.trim().length > 0)
                namespaceName = response;    
        } while (!namespaceName || !isValidNamespace(namespaceName));
        
        console.log();

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

        console.log("Do you want to add a description for the new namespace?");
        console.log();
        console.log("Enter the namespace description or press enter to continue.");
        console.log();

        const response = await rl.question("Description: ");

        if (response && response.trim().length > 0)
            namespaceDetails.description = response;

        console.log();

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

        console.log("Do you want to add a markdown description for the new namespace?");
        console.log();
        console.log("Enter the namespace markdown description or press enter to continue.");
        console.log();

        const response = await rl.question("Markdown Description: ");

        if (response && response.trim().length > 0)
            namespaceDetails.markdownDescription = response;

        console.log();

    };


    /* Main Script */

    try {
        // Process the command-line arguments
        for (let i = 2; i < process.argv.length; i++) {
            const arg = process.argv[i];
            const lcArg = arg.toLowerCase();
    
            if (arg == '-n' || lcArg == '--namespace') {
                const nextArg = process.argv[i + 1];
    
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
                const nextArg = process.argv[i + 1];
    
                if (nextArg !== undefined && nextArg.length > 0) {
                    namespaceDetails.description = process.argv[i + 1];
                    i++;
                }
                else {
                    console.error(`The ${arg} option must be followed by the description of the new namespace.`);
                }
            }
            else if (arg == '-m' || lcArg == '--markdown-description') {
                const nextArg = process.argv[i + 1];
    
                if (nextArg !== undefined && nextArg.length > 0) {
                    namespaceDetails.markdownDescription = process.argv[i + 1];
                    i++;
                }
                else {
                    console.error(`The ${arg} option must be followed by the markdown description of the new namespace.`);
                }
            }
            else if (lcArg == '--dry-run') {
                dryRun = true;
            }
            else if (['/?', '--usage', '--help'].includes(lcArg)) {
                console.log("Usage: add-namespace [--dry-run] [--usage | --help]");
                console.log("                     [[-n | --namespace] <Namespace>]");
                console.log("                     [[-d | --description] <Description>]");
                console.log("                     [[-m | --markdown-description] <Markdown Description>]");
                console.log();
                console.log("A helper script used to add a new Namespace to the TypeScript Toolkit.");
                console.log();
                console.log();
                console.log("Command-Line Arguments:");
                console.log();
                console.log("       --usage, --help:            Show this usage message");
                console.log("       --dry-run:                  Show what changes would be made");
                console.log();
                console.log("   -n, --namespace:                The name of the new namespace to add.");
                console.log("   -d, --description:              The description of the new namespace.");
                console.log("   -m, --markdown-description:     The markdown description of the new namespace.");
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
            
            while (!confirmed) {
                /** The user's response to the confirmation prompt. */
                let response: string = "";

                console.log();
                console.log("Does everything look right?");
                console.log({
                    name: namespaceName,
                    description: namespaceDetails.description,
                    markdownDescription: namespaceDetails.markdownDescription
                });
        
                // Continue re-prompting the user until a valid response is provided.
                while ( !['yes', 'y', 'no', 'n'].includes(response) )
                    response = (await rl.question("(Y)es/(N)o: ")).toLowerCase();

                console.log();
        
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
                }
            }
        }
        // If the Namespace Name specified via the command-line
        // is invalid, the script should terminate immediately
        // after the error message is printed by `isValidNamespace()`.
        else if (!isValidNamespace(namespaceName!)) {
            return;
        }
        
        // Update the Toolkit Schema to add the new Namespace.
        schema[namespaceName!] = namespaceDetails;
        updateToolkitSchema(schema, dryRun);
    
        if (!dryRun) {
            /** The result of processing the Updated Toolkit Schema. */
            const result = spawnSync(
                'node',
                ['--experimental-transform-types', 'process-toolkit-schema.ts', '--skip-dependency-imports'],
                { shell: true, stdio: 'inherit' }
            ).status;
    
            if (result === 0)
                console.log(`Successfully added namespace '${namespaceName!}'!`);
        }
    }
    catch (error) {
        throw error;
    }
    finally {
        rl.close();
    }

})();