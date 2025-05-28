/*
 * Add a new Namespace to the TypeScript Toolkit.
 * 
 * @author Zach Vaughan (FusedKush)
 */

import { spawnSync } from "node:child_process";
import {
    type ToolkitSchema,
    fetchToolkitSchema,
    updateToolkitSchema
} from "./utils.ts";
import Readline from "node:readline/promises";


// Main Script
(async () => {

    let schema: ToolkitSchema = fetchToolkitSchema();
    let rl = Readline.createInterface(process.stdin, process.stdout);
    let namespace: string | null = null;
    let namespaceDetails: ToolkitSchema[string] = { tools: {} };
    let interactiveMode: boolean = true;
    let dryRun: boolean = false;
    let confirmed: boolean = false;

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

    const promptForName = async () => {

        
        console.log("Please enter the name of the new namespace");
        console.log();

        do {
            const response = await rl.question("Namespace Name: ");

            if (response && response.trim().length > 0)
                namespace = response;    
        } while (!namespace || !isValidNamespace(namespace));
        
        console.log();

    };
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


    try {
        for (let i = 2; i < process.argv.length; i++) {
            const arg = process.argv[i];
            const lcArg = arg.toLowerCase();
    
            if (arg == '-n' || lcArg == '--namespace') {
                const nextArg = process.argv[i + 1];
    
                if (nextArg !== undefined && nextArg.length > 0) {
                    namespace = process.argv[i + 1];
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
    
        if (!namespace)
            await promptForName();
        else if (!isValidNamespace(namespace))
            return;
    
        if (interactiveMode) {
            if (!namespaceDetails.description)
                await promptForDescription();
            if (!namespaceDetails.markdownDescription)
                await promptForMarkdownDescription();
            
            while (!confirmed) {
                console.log();
                console.log("Does everything look right?");
                console.log({
                    name: namespace,
                    description: namespaceDetails.description,
                    markdownDescription: namespaceDetails.markdownDescription
                });
        
                let response: string = "";
        
                while ( !['yes', 'y', 'no', 'n'].includes(response) )
                    response = (await rl.question("(Y)es/(N)o: ")).toLowerCase();

                console.log();
        
                if (response.startsWith('y')) {
                    confirmed = true;
                }
                else {
                    await promptForName();
                    await promptForDescription();
                    await promptForMarkdownDescription();
                }
            }
        }
    
        schema[namespace!] = namespaceDetails;
        updateToolkitSchema(schema, dryRun);
    
        if (!dryRun) {
            const result = spawnSync(
                'node',
                ['--experimental-transform-types', 'process-toolkit-schema.ts', '--skip-dependency-imports'],
                { shell: true, stdio: 'inherit' }
            ).status;
    
            if (result === 0)
                console.log(`Successfully added namespace '${namespace!}'!`);
        }
    }
    catch (error) {
        throw error;
    }
    finally {
        rl.close();
    }

})();