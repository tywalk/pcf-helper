/**
 * Imports a PCF solution into a specified Dataverse environment.
 *
 * @param {string} path - The path to the solution folder containing the build output.
 * @param {string} env - The environment identifier (GUID or URL) where the solution will be imported.
 * @param {boolean} verbose - If true, additional debug information is logged.
 *
 * @returns {number} The exit status of the import process.
 */
declare function run(path: string, env: string, verbose?: boolean): number;
export { run };
