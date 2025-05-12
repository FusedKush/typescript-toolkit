/*
 * A simple Node script responsible for installing
 * the package by compiling the TypeScript Files
 * into JavaScript and deleting the source code files
 * once they are no longer needed.
 * 
 * @author Zach Vaughan (FusedKush)
 */

import { spawn } from "node:child_process";
import { rmSync } from "node:fs";


/**
 * An enumeration defining the potential
 * {@link process.exitCode Exit Codes} that
 * can be returned by the install script.
 * 
 * @enum {number}
 */
const ExitCode = {

    /**
     * A fatal error occurred during the compilation process. 
     */
    ERROR: -1,
    /**
     * The installation completed successfully.
     */
    SUCCESS: 0

};
/**
 * The name of the NPM Package.
 * 
 * @satisfies {string}
 */
const PACKAGE_NAME = (/** @type {string} */ (process.env.npm_package_name));


// Set the exit code now in case anything happens.
process.exitCode = ExitCode.ERROR;

// Compile TypeScript Files in `/toolkit` to JavaScript Files in `/dist`.
const childProc = spawn('npx', ['tsc'], { stdio: 'inherit', shell: true });

childProc.on('exit', (code) => {

    process.exitCode = ExitCode.SUCCESS;

    if (code == 0) {
        // Remove the Source Code & Installation Files once we're done.
        try {
            rmSync('./install.js');
            rmSync('./toolkit', { recursive: true });
        }
        catch (error) {
            console.warn(
                `Failed to remove Source Code & Installation Files for the '${PACKAGE_NAME}' package:`,
                error
            );
        }
    }

});
childProc.on(
    'error',
    (error) => console.error(`Failed to compile the '${PACKAGE_NAME}' package:`, error)
);
