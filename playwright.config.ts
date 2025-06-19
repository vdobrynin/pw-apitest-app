import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',                  // #61 for debugging for more info
    // trace: 'on-first-retry',   // this is if fail to retry
    extraHTTPHeaders: {                                      // #60 authorization token as process env variable    
      'Authorization': `Token ${process.env.ACCESS_TOKEN}`
    }
  },
  globalSetup: require.resolve('./global-setup.ts'),        // #70 --> global setup
  globalTeardown: require.resolve('./global-teardown.ts'),   // #70 --> global teardown

  /* Configure projects for major browsers */
  projects: [                                       // #59 
    { name: 'setup', testMatch: 'auth.setup.ts' },
    {
      name: 'articleSetup',                       // #69.1
      testMatch: 'newArticle.setup.ts',
      dependencies: ['setup'],
      teardown: 'articleCleanUp'                // #69.2
    },
    {
      name: 'articleCleanUp',                   // #69.2
      testMatch: 'articleCleanUp.setup.ts'
    },
    {                                               // #69.1
      name: 'regression',
      testIgnore: 'likesCounter.spec.ts',           // #70 --> for global setup & teardown
      use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
      dependencies: ['setup']
    },
    {                                               // #69.1
      name: 'likeCounter',
      testMatch: 'likesCounter.spec.ts',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
      dependencies: ['articleSetup']
    },
    {
      name: 'likeCounterGlobal',      // #70 --> for global setup & teardown without dependencies
      testMatch: 'likesCounterGlobal.spec.ts',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
    },
    // {                                                         // #69
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
    //   dependencies: ['setup']
    // },
    // {                                             // #59  //--> remove unneeded below (?maybe later?)
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'], storageState: '.auth/user.json' },
    //   dependencies: ['setup']
    // },
    // {                                             // #59 
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'], storageState: '.auth/user.json' },
    //   dependencies: ['setup']
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
