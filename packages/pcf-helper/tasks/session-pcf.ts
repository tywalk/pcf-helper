import logger from '@tywalk/color-logger';
import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';
import { spawn, ChildProcess } from 'child_process';

export type SessionOptions = {
  verbose?: boolean;
  url?: string;
  script?: string;
  stylesheet?: string;
  bundle?: string;
  css?: string;
  config?: string;
  watch?: boolean;
};

interface FileConfig {
  remoteEnvironmentUrl?: string;
  remoteScriptToIntercept?: string;
  remoteStylesheetToIntercept?: string;
  localCssPath?: string;
  localBundlePath?: string;
  startWatch?: boolean;
}

/**
 * Loads configuration for the session task, supporting a combination of config file, environment variables, and CLI arguments.
 * The priority order is: CLI arguments > environment variables > config file > defaults.
 * It also handles constructing full URLs for the script and stylesheet to intercept, allowing for relative paths in the config that are combined with the base URL.
 * @param config Optional path to a JSON config file. If not provided, it will look for 'session.config.json' in the current working directory.
 * @returns An object containing the resolved configuration values for the session task.
 */
function loadConfig(config?: string): Partial<FileConfig> {
  // Load file config if exists
  let fileConfig: FileConfig = {};
  const configPath = path.join(process.cwd(), config || 'session.config.json');
  logger.log(`📁 Looking for config file at: ${configPath}`);
  if (fs.existsSync(configPath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8')) as FileConfig;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      logger.error(`❌ Failed to parse config file at ${configPath}: ${message}`);
      return {};
    }
    logger.log(`✅ Loaded config file: ${JSON.stringify(fileConfig, null, 2)}`);
  } else if (process.env.REMOTE_ENVIRONMENT_URL) {
    logger.warn(`⚠️ Config file not found, using defaults or CLI/env options.`);
  } else {
    return {}; // No config file and no env vars, return empty config to use defaults
  }

  // Get the base URL first
  const remoteEnvironmentUrl =
    process.env.REMOTE_ENVIRONMENT_URL ||
    fileConfig.remoteEnvironmentUrl;

  // Handle script argument - support both relative paths and full URLs
  let remoteScriptToIntercept =
    process.env.REMOTE_SCRIPT_TO_INTERCEPT ||
    fileConfig.remoteScriptToIntercept;

  // If script is a relative path (doesn't start with http/https), combine with base URL
  if (remoteScriptToIntercept && remoteEnvironmentUrl && !remoteScriptToIntercept.startsWith('http')) {
    // Normalize the base URL (remove trailing slash)
    const baseUrl = remoteEnvironmentUrl.replace(/\/$/, '');
    // Normalize the script path (ensure it starts with /)
    const scriptPath = remoteScriptToIntercept.startsWith('/')
      ? remoteScriptToIntercept
      : '/' + remoteScriptToIntercept;
    remoteScriptToIntercept = `${baseUrl}${scriptPath}`;
  }

  let remoteStylesheetToIntercept =
    process.env.REMOTE_STYLESHEET_TO_INTERCEPT ||
    fileConfig.remoteStylesheetToIntercept;

  // If stylesheet is a relative path (doesn't start with http/https), combine with base URL
  if (remoteStylesheetToIntercept && remoteEnvironmentUrl && !remoteStylesheetToIntercept.startsWith('http')) {
    // Normalize the base URL (remove trailing slash)
    const baseUrl = remoteEnvironmentUrl.replace(/\/$/, '');
    // Normalize the stylesheet path (ensure it starts with /)
    const stylesheetPath = remoteStylesheetToIntercept.startsWith('/')
      ? remoteStylesheetToIntercept
      : '/' + remoteStylesheetToIntercept;
    remoteStylesheetToIntercept = `${baseUrl}${stylesheetPath}`;
  }


  // Priority: CLI args > env vars > config file > defaults
  return {
    remoteEnvironmentUrl: remoteEnvironmentUrl,
    remoteScriptToIntercept: remoteScriptToIntercept,
    remoteStylesheetToIntercept: remoteStylesheetToIntercept,
    localCssPath:
      process.env.LOCAL_CSS_PATH ??
      fileConfig.localCssPath,
    localBundlePath:
      process.env.LOCAL_BUNDLE_PATH ??
      fileConfig.localBundlePath,
    startWatch:
      process.env.START_WATCH === 'true' ||
      fileConfig.startWatch || false,
  };
}

/**
 * Runs an ephemeral browser session that intercepts requests to the specified remote script and stylesheet URLs, serving local files instead.
 * It also manages session state by saving cookies and local storage to a file, allowing for persistent login sessions across runs.
 * The session will automatically clean up and save state on exit, including handling various exit signals and browser events.
 * @param remoteEnvironmentUrl The URL of the remote environment to navigate to.
 * @param remoteScriptToIntercept The full URL of the remote script to intercept (e.g., https://app.your-remote-environment.com/static/js/remote-control-bundle.js).
 * @param remoteStylesheetToIntercept The full URL of the remote stylesheet to intercept (e.g., https://app.your-remote-environment.com/static/css/remote-control-styles.css).
 * @param localBundlePath The local file path to the JavaScript bundle that should be served when the remote script URL is requested.
 * @param localCssPath The local file path to the CSS file that should be served when the remote stylesheet URL is requested.
 * @param startWatch Optional flag to start the session in watch mode. If true, the process will kick off "pcf-scripts start watch" in parallel to automatically rebuild the bundle on changes.
 * @returns A promise that resolves when the session is set up and running. The session will continue to run until the process is exited, at which point it will clean up and save state.
 */
async function runSession(remoteEnvironmentUrl: string, remoteScriptToIntercept: string, remoteStylesheetToIntercept: string, localBundlePath: string, localCssPath: string, startWatch?: boolean) {
  if (!remoteEnvironmentUrl) {
    logger.error('❌ Remote environment URL is required. Please provide it via CLI, config file, or environment variable.');
    process.exit(1);
  }
  if (!remoteScriptToIntercept) {
    logger.error('❌ Remote script URL to intercept is required. Please provide it via CLI, config file, or environment variable.');
    process.exit(1);
  }
  if (!localBundlePath) {
    logger.error('❌ Local bundle path is required. Please provide it via CLI, config file, or environment variable.');
    process.exit(1);
  }
  const REMOTE_ENVIRONMENT_URL = remoteEnvironmentUrl;
  const REMOTE_SCRIPT_TO_INTERCEPT = remoteScriptToIntercept;
  const REMOTE_STYLESHEET_TO_INTERCEPT = remoteStylesheetToIntercept;
  const LOCAL_BUNDLE_PATH = path.resolve(localBundlePath);
  const LOCAL_CSS_PATH = path.resolve(localCssPath);

  // Debug logging for URL construction
  logger.debug('🔍 Debug - Final URLs:');
  logger.debug(`   Remote Environment: ${REMOTE_ENVIRONMENT_URL}`);
  logger.debug(`   Script to intercept: ${REMOTE_SCRIPT_TO_INTERCEPT}`);
  logger.debug(`   CSS to intercept: ${REMOTE_STYLESHEET_TO_INTERCEPT}`);
  logger.debug(`   Local bundle path: ${LOCAL_BUNDLE_PATH}`);
  logger.debug(`   Local CSS path: ${LOCAL_CSS_PATH}`);
  logger.debug('');

  // Path to store your session cookies
  const AUTH_DIR = path.join(process.cwd(), '.auth');
  const STATE_FILE = path.join(AUTH_DIR, 'state.json');

  // Start watch process if requested
  let watchProcess: ChildProcess | undefined;
  if (startWatch) {
    logger.log('🔧 Starting pcf-scripts watch process...');
    watchProcess = spawn('pcf-scripts', ['start', 'watch'], {
      cwd: process.cwd(),
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    watchProcess.stdout?.on('data', (data) => {
      logger.log(`📦 [PCF Watch] ${data.toString().trim()}`);
    });

    watchProcess.stderr?.on('data', (data) => {
      logger.warn(`⚠️ [PCF Watch] ${data.toString().trim()}`);
    });

    watchProcess.on('exit', (code) => {
      if (code !== null && code !== 0) {
        logger.error(`❌ PCF watch process exited with code ${code}`);
      } else {
        logger.log('✅ PCF watch process ended');
      }
    });

    watchProcess.on('error', (error) => {
      logger.error('❌ Failed to start PCF watch process:', error);
    });
  }

  await (async () => {
    logger.log('🚀 Starting ephemeral browser session...');

    // 1. Prepare context options (load session if it exists)
    const contextOptions: { storageState?: string } = {};
    if (fs.existsSync(STATE_FILE)) {
      logger.log('🔓 Loading previous login session...');
      contextOptions.storageState = STATE_FILE;
    } else {
      logger.log('⚠️ No previous session found. You may need to log in.');
    }

    // 2. Launch browser and apply context
    const browser = await chromium.launch({ headless: false, args: ['--auto-open-devtools-for-tabs'] });
    const context = await browser.newContext({
      ...contextOptions,
      viewport: null, // Use the actual browser window size
      serviceWorkers: 'block', // Block service workers to prevent caching issues during development
    });

    // Guard to prevent multiple concurrent or duplicate cleanups
    let isCleaningUp = false;

    // Shared cleanup function to save state and close browser
    const cleanup = async (reason = 'unknown') => {
      if (isCleaningUp) return;
      isCleaningUp = true;
      try {
        logger.log(`💾 Saving session state (${reason})...`);

        // Kill the watch process if it's running
        if (watchProcess && !watchProcess.killed) {
          logger.log('🛑 Terminating PCF watch process...');
          watchProcess.kill('SIGTERM');

          // Give it a chance to exit gracefully, then force kill if needed
          setTimeout(() => {
            if (watchProcess && !watchProcess.killed) {
              logger.warn('⚠️ Force killing PCF watch process...');
              watchProcess.kill('SIGKILL');
            }
          }, 2000);
        }

        // Ensure the .auth directory exists before saving
        if (!fs.existsSync(AUTH_DIR)) {
          fs.mkdirSync(AUTH_DIR, { recursive: true });
        }

        if (!browser.isConnected()) {
          logger.log('Browser already disconnected.');
        } else {
          // Save the cookies and local storage to the JSON file
          await context.storageState({ path: STATE_FILE });

          logger.log('🛑 Tearing down rules and session.');

          await browser.close();
        }
      } catch (error) {
        logger.debug('Error during cleanup:', error);
      }
    };

    // Handle process exit signals — use .then() chaining since Node does not await async handlers
    process.on('SIGINT', () => {
      cleanup('SIGINT').then(() => process.exit(0));
    });

    process.on('SIGTERM', () => {
      cleanup('SIGTERM').then(() => process.exit(0));
    });

    process.on('beforeExit', () => {
      cleanup('beforeExit').catch((err) => logger.debug('Cleanup error on beforeExit:', err));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      cleanup('uncaughtException').then(() => process.exit(1));
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection:', reason);
      cleanup('unhandledRejection').then(() => process.exit(1));
    });

    // Handle browser disconnect
    browser.on('disconnected', () => {
      logger.log('Browser disconnected');
      cleanup('browser disconnected').catch((err) => logger.debug('Cleanup error on browser disconnect:', err));
    });

    // Handle context close (when all pages in context are closed)
    context.on('close', () => {
      logger.log('Browser context closed');
      cleanup('context closed').then(() => process.exit(0));
    });

    // 3. Programmatically apply your network interception rule with pattern matching
    // Handle dynamic version segments in CRM URLs like /version?/webresources/...
    const scriptPattern = REMOTE_SCRIPT_TO_INTERCEPT.replace(/^https?:\/\/[^\/]+/, '');
    const stylesheetPattern = REMOTE_STYLESHEET_TO_INTERCEPT.replace(/^https?:\/\/[^\/]+/, '');

    logger.debug(`📡 Setting up interception patterns:`);
    logger.debug(`   Script pattern: **${scriptPattern}`);
    logger.debug(`   CSS pattern: **${stylesheetPattern}`);

    await context.route(route => {
      if (!route.href) {
        return false;
      }
      // Match script URLs that end with the same path structure
      return route.href.includes(scriptPattern);
    }, async (route) => {
      logger.log(`✅ Intercepted script request: ${route.request().url()}`);
      logger.log(`   Serving local file: ${LOCAL_BUNDLE_PATH}`);

      try {
        const body = fs.readFileSync(LOCAL_BUNDLE_PATH);
        route.fulfill({ status: 200, contentType: 'application/javascript', body });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        logger.error(`❌ Failed to read local bundle at ${LOCAL_BUNDLE_PATH}: ${message}`);
        route.fulfill({ status: 500, body: `// Bundle file not found: ${LOCAL_BUNDLE_PATH}` });
      }
    });

    // Only intercept the remote stylesheet request if both the local CSS path and the remote URL to intercept have been provided
    if (LOCAL_CSS_PATH && REMOTE_STYLESHEET_TO_INTERCEPT) {
      await context.route(route => {
        if (!route.href) {
          return false;
        }
        // Match CSS URLs that end with the same path structure
        return route.href.includes(stylesheetPattern);
      }, async (route) => {
        logger.log(`✅ Intercepted CSS request: ${route.request().url()}`);
        logger.log(`   Serving local file: ${LOCAL_CSS_PATH}`);

        try {
          const body = fs.readFileSync(LOCAL_CSS_PATH);
          route.fulfill({ status: 200, contentType: 'text/css', body });
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          logger.error(`❌ Failed to read local CSS at ${LOCAL_CSS_PATH}: ${message}`);
          route.fulfill({ status: 500, body: `/* CSS file not found: ${LOCAL_CSS_PATH} */` });
        }
      });
    }

    // 4. Open a new tab and navigate to your remote environment
    const page = await context.newPage();
    await page.goto(REMOTE_ENVIRONMENT_URL);

    // 5. Clean up and save state when the page is closed (but others may still be open)
    page.on('close', async () => {
      const pages = context.pages();
      if (pages.length <= 1) {
        // This was the last page, trigger full cleanup
        await cleanup('last page closed');
        process.exit(0);
      } else {
        logger.debug(`Page closed, but ${pages.length - 1} pages still open. Keeping session alive.`);
      }
    });

    // 6. Watch the local bundle for changes and auto-reload
    let reloadTimeout: NodeJS.Timeout;
    fs.watch(LOCAL_BUNDLE_PATH, (eventType) => {
      if (eventType === 'change') {
        // Clear the previous timer if the file changes again quickly
        clearTimeout(reloadTimeout);

        // Wait 300ms for the bundler to finish writing the file before reloading
        reloadTimeout = setTimeout(async () => {
          logger.log(`\n🔄 Local bundle updated! Reloading the page...`);
          try {
            await page.reload();
          } catch (err) {
            logger.error('⚠️ Could not reload page (browser might be closed).', err);
          }
        }, 300);
      }
    });
  })();
}

export { runSession, loadConfig };