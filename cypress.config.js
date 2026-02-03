module.exports = {
  e2e: {
    baseUrl: 'https://employer.veloxlabs.net', // Update with your actual application URL
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
    requestTimeout: 8000,
    responseTimeout: 8000,
    pageLoadTimeout: 30000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // Example: Custom tasks for database operations
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
    env: {
      // Set environment variables
      apiUrl: 'employer.veloxlabs.net/api',
      appUrl: 'https://employer.veloxlabs.net',
    },
    // Screenshot and video configuration
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: false,
    // Test isolation
    testIsolation: true,
    // Retries
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },
};

