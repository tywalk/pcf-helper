/**
 * Upgrades the Power Apps component framework project.
 *
 * @param {string} path The path to the project folder containing the pcfproj.json file.
 * @param {boolean} verbose - If true, additional debug information is logged.
 *
 * @returns {number} The exit code of the spawned process.
 */
declare function run(path: string, verbose?: boolean): number;
export { run };
