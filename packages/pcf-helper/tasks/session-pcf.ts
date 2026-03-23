import logger from '@tywalk/color-logger';
import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';
import { Command } from 'commander';

function loadConfig() {
  const program = new Command();

  program
    .option('-u, --url <url>', 'remote environment URL')
    .option('-s, --script <script>', 'remote script to intercept')
    .option('-t, --stylesheet <stylesheet>', 'remote stylesheet to intercept')
    .option('-b, --bundle <path>', 'local bundle path')
    .option('-c, --css <path>', 'local CSS path')
    .option('-f, --config <path>', 'config file path', 'dev-config.json')
    .parse();

  const options = program.opts();

  // Load file config if exists
  let fileConfig = {} as any;
  const configPath = path.join(__dirname, options.config);
  console.log(`📁 Looking for config file at: ${configPath}`);
  if (fs.existsSync(configPath)) {
    fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(`✅ Loaded config file: ${JSON.stringify(fileConfig, null, 2)}`);
  } else {
    console.log(`⚠️ Config file not found, using defaults or CLI/env options.`);
  }

  // Get the base URL first
  const remoteEnvironmentUrl =
    options.url ||
    process.env.REMOTE_ENVIRONMENT_URL ||
    fileConfig.remoteEnvironmentUrl ||
    'https://app.your-remote-environment.com';

  // Handle script argument - support both relative paths and full URLs
  let remoteScriptToIntercept =
    options.script ||
    process.env.REMOTE_SCRIPT_TO_INTERCEPT ||
    fileConfig.remoteScriptToIntercept ||
    'https://app.your-remote-environment.com/static/js/remote-control-bundle.js';

  // If script is a relative path (doesn't start with http/https), combine with base URL
  if (remoteScriptToIntercept && !remoteScriptToIntercept.startsWith('http')) {
    // Normalize the base URL (remove trailing slash)
    const baseUrl = remoteEnvironmentUrl.replace(/\/$/, '');
    // Normalize the script path (ensure it starts with /)
    const scriptPath = remoteScriptToIntercept.startsWith('/')
      ? remoteScriptToIntercept
      : '/' + remoteScriptToIntercept;
    remoteScriptToIntercept = `${baseUrl}${scriptPath}`;
  }

  let remoteStylesheetToIntercept =
    options.stylesheet ||
    process.env.REMOTE_STYLESHEET_TO_INTERCEPT ||
    fileConfig.remoteStylesheetToIntercept ||
    'https://app.your-remote-environment.com/static/css/remote-control-styles.css';

  // If stylesheet is a relative path (doesn't start with http/https), combine with base URL
  if (remoteStylesheetToIntercept && !remoteStylesheetToIntercept.startsWith('http')) {
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
      options.css ||
      process.env.LOCAL_CSS_PATH ||
      fileConfig.localCssPath ||
      path.join(__dirname, 'dist', 'local-control-styles.css'),
    localBundlePath:
      options.bundle ||
      process.env.LOCAL_BUNDLE_PATH ||
      fileConfig.localBundlePath ||
      path.join(__dirname, 'dist', 'local-control-bundle.js')
  };
}

function runSession(remoteEnvironmentUrl: string, remoteScriptToIntercept: string, remoteStylesheetToIntercept: string, localBundlePath: string, localCssPath: string) {
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
  const AUTH_DIR = path.join(__dirname, '.auth');
  const STATE_FILE = path.join(AUTH_DIR, 'state.json');

  (async () => {
    logger.log('🚀 Starting ephemeral browser session...');

    // 1. Prepare context options (load session if it exists)
    let contextOptions = {} as any;
    if (fs.existsSync(STATE_FILE)) {
      logger.log('🔓 Loading previous login session...');
      contextOptions.storageState = STATE_FILE;
    } else {
      logger.log('⚠️ No previous session found. You may need to log in.');
    }

    // 2. Launch browser and apply context
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      ...contextOptions,
      viewport: null // Use the actual browser window size
    });

    // Shared cleanup function to save state and close browser
    const cleanup = async (reason = 'unknown') => {
      try {
        logger.log(`💾 Saving session state (${reason})...`);

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
        logger.error('Error during cleanup:', error);
      }
    };

    // Handle process exit signals
    process.on('SIGINT', async () => {
      await cleanup('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await cleanup('SIGTERM');
      process.exit(0);
    });

    process.on('beforeExit', async () => {
      await cleanup('beforeExit');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      logger.error('Uncaught exception:', error);
      await cleanup('uncaughtException');
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason) => {
      logger.error('Unhandled promise rejection:', reason);
      await cleanup('unhandledRejection');
      process.exit(1);
    });

    // Handle browser disconnect
    browser.on('disconnected', async () => {
      logger.log('Browser disconnected');
      await cleanup('browser disconnected');
    });

    // Handle context close (when all pages in context are closed)
    context.on('close', async () => {
      logger.log('Browser context closed');
      await cleanup('context closed');
      process.exit(0);
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
      return route.href.includes(scriptPattern) && route.href.includes('bundle.js');
    }, async (route) => {
      logger.log(`✅ Intercepted script request: ${route.request().url()}`);
      logger.log(`   Serving local file: ${LOCAL_BUNDLE_PATH}`);

      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: fs.readFileSync(LOCAL_BUNDLE_PATH)
      });
    });

    await context.route(route => {
      if (!route.href) {
        return false;
      }
      // Match CSS URLs that end with the same path structure  
      return route.href.includes(stylesheetPattern) && route.href.includes('ItemDescriptionPCF.css');
    }, async (route) => {
      logger.log(`✅ Intercepted CSS request: ${route.request().url()}`);
      logger.log(`   Serving local file: ${LOCAL_CSS_PATH}`);

      route.fulfill({
        status: 200,
        contentType: 'text/css',
        body: fs.readFileSync(LOCAL_CSS_PATH)
      });
    });

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