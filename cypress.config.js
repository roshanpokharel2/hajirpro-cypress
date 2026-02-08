module.exports = {
  e2e: {
    baseUrl: 'https://employer.veloxlabs.net', 
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
    requestTimeout: 8000,
    responseTimeout: 8000,
    pageLoadTimeout: 30000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
    env: {
      apiUrl: 'staging.veloxlabs.net/api/v2',
      appUrl: 'https://employer.veloxlabs.net',
    },
    // Screenshot and video configuration
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,
    videoCompression: 32,
    // Test isolation
    testIsolation: true,
    // Retries
    retries: {
      runMode: 0,
      openMode: 0,
    },
    // Reporter configuration
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      reportFilename: 'report-[datetime]',
      datetime: 'mmddyyyy_HHMMss',
      html: true,
      json: true,
    },
  },
};

