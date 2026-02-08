const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { generateHtmlReport } = require('./generate-html-report');

// Load .env file if it exists
if (fs.existsSync(path.join(__dirname, '.env'))) {
  require('dotenv').config();
}

// Get Slack webhook from environment variable
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Parse test report - intelligently merge reports from current test run
function getLatestReport() {
  const reportsDir = path.join(__dirname, 'cypress/reports');
  
  if (!fs.existsSync(reportsDir)) {
    console.log('Reports directory not found');
    return null;
  }

  const files = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.json'));

  if (files.length === 0) return null;

  // Get file creation times
  const filesWithTime = files.map(file => {
    const filePath = path.join(reportsDir, file);
    const stats = fs.statSync(filePath);
    return {
      name: file,
      time: stats.mtimeMs // modification time in milliseconds
    };
  }).sort((a, b) => b.time - a.time); // Sort by newest first

  // Find the most recent batch of files (created within 60 seconds of each other)
  const timeBatch = [];
  const batchThreshold = 60000; // 60 seconds
  
  if (filesWithTime.length > 0) {
    const mostRecentTime = filesWithTime[0].time;
    
    for (const file of filesWithTime) {
      if (mostRecentTime - file.time <= batchThreshold) {
        timeBatch.push(file.name);
      }
    }
  }

  console.log(`📊 Merging ${timeBatch.length} report files from current test run...`);

  // Merge all files from the current batch
  let mergedReport = {
    stats: {
      tests: 0,
      passes: 0,
      failures: 0,
      pending: 0,
      duration: 0
    },
    suites: [],
    allSuites: []
  };

  timeBatch.forEach(file => {
    const reportPath = path.join(reportsDir, file);
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    
    if (report.stats) {
      mergedReport.stats.tests += report.stats.tests || 0;
      mergedReport.stats.passes += report.stats.passes || 0;
      mergedReport.stats.failures += report.stats.failures || 0;
      mergedReport.stats.pending += report.stats.pending || 0;
      mergedReport.stats.duration += report.stats.duration || 0;
    }

    if (report.suites && report.suites.length > 0) {
      mergedReport.suites.push(...report.suites);
      mergedReport.allSuites.push(...report.suites);
    }
  });

  return mergedReport;
}

// Get file-wise test breakdown
function getFileWiseBreakdown(report) {
  const suites = report.suites || [];
  const breakdown = {};

  function parseSuites(suitesArray, parentTitle = '') {
    suitesArray.forEach(suite => {
      const title = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;
      
      if (suite.tests && suite.tests.length > 0) {
        if (!breakdown[title]) {
          breakdown[title] = { passed: 0, failed: 0, pending: 0, tests: [] };
        }

        suite.tests.forEach(test => {
          if (test.state === 'passed') {
            breakdown[title].passed++;
          } else if (test.state === 'failed') {
            breakdown[title].failed++;
            breakdown[title].tests.push({
              name: test.title,
              error: test.err?.message || 'Unknown error',
            });
          } else if (test.state === 'pending') {
            breakdown[title].pending++;
          }
        });
      }

      if (suite.suites && suite.suites.length > 0) {
        parseSuites(suite.suites, title);
      }
    });
  }

  parseSuites(suites);
  return breakdown;
}

// Get available screenshots
function getFailedTestScreenshots() {
  const screenshotsDir = path.join(__dirname, 'cypress/screenshots');
  const screenshots = {};

  if (!fs.existsSync(screenshotsDir)) {
    return screenshots;
  }

  const dirs = fs.readdirSync(screenshotsDir);
  dirs.forEach(dir => {
    const dirPath = path.join(screenshotsDir, dir);
    if (fs.statSync(dirPath).isDirectory()) {
      const files = fs.readdirSync(dirPath);
      if (files.length > 0) {
        screenshots[dir] = files.map(file => path.join(dir, file));
      }
    }
  });

  return screenshots;
}

// Send Slack message
async function sendSlackNotification() {
  if (!SLACK_WEBHOOK_URL) {
    console.log('⚠️  SLACK_WEBHOOK_URL not set. Skipping Slack notification.');
    return;
  }

  const report = getLatestReport();
  if (!report) {
    console.log('No test report found');
    return;
  }

  const stats = report.stats || {};
  const passed = stats.passes || 0;
  const failed = stats.failures || 0;
  const pending = stats.pending || 0;
  const total = stats.tests || 0;
  const duration = stats.duration || 0;

  const isAllPassed = failed === 0 && total > 0;
  const color = isAllPassed ? '#36a64f' : '#dc3545';
  const emoji = isAllPassed ? '✅' : '❌';

  const fileBreakdown = getFileWiseBreakdown(report);
  const screenshots = getFailedTestScreenshots();

  // Build main attachment
  let attachments = [
    {
      color: color,
      title: `${emoji} Cypress Test Report`,
      text: isAllPassed ? '🎉 Congrats QA [ ROSHAN DAJU & SURAKSHA DIJU ]❤️ you did it! 🚀' : '⚠️ Some Tests Failed',
      fields: [
        {
          title: 'Total Tests',
          value: total.toString(),
          short: true,
        },
        {
          title: 'Passed',
          value: `✅ ${passed}`,
          short: true,
        },
        {
          title: 'Failed',
          value: `❌ ${failed}`,
          short: true,
        },
        {
          title: 'Pass Rate',
          value: `${total > 0 ? ((passed / total) * 100).toFixed(2) : 0}%`,
          short: true,
        },
        {
          title: 'Duration',
          value: `${(duration / 1000).toFixed(2)}s`,
          short: true,
        },
        {
          title: 'Pending',
          value: pending.toString(),
          short: true,
        },
      ],
      footer: 'Cypress Test Automation',
      ts: Math.floor(Date.now() / 1000),
    },
  ];

  // Generate HTML Report
  const reportPath = generateHtmlReport();
  
  // Add HTML Report link section (Viewable via HTTP)
  if (reportPath && fs.existsSync(reportPath)) {
    attachments.push({
      color: '#667eea',
      title: '📊 View Full HTML Report',
      text: '🌐 Open this link to view the comprehensive test report with beautiful styling and interactive charts\n\n⚡ Start report server:\n`npm run serve:report`\n\nThen open: http://localhost:3000',
      mrkdwn_in: ['text'],
    });
  }

  // Add file-wise summary
  let fileWiseSummary = '*📋 File-Wise Summary:*\n';
  let hasData = false;

  for (const [file, data] of Object.entries(fileBreakdown)) {
    hasData = true;
    const fileTotal = data.passed + data.failed + data.pending;
    const filePassRate = fileTotal > 0 ? ((data.passed / fileTotal) * 100).toFixed(0) : 0;
    fileWiseSummary += `\n📄 *${file}*\n`;
    fileWiseSummary += `   ✅ Passed: ${data.passed} | ❌ Failed: ${data.failed} | ⏳ Pending: ${data.pending}\n`;
    fileWiseSummary += `   Success Rate: ${filePassRate}%\n`;

    // Add failed test details
    if (data.failed > 0 && data.tests.length > 0) {
      fileWiseSummary += `   Failed Tests:\n`;
      data.tests.forEach(test => {
        fileWiseSummary += `   • ${test.name}\n`;
      });
    }
  }

  // Add summary section
  if (hasData) {
    attachments.push({
      color: '#0099ff',
      title: '📊 Test Summary by File',
      text: fileWiseSummary,
      mrkdwn_in: ['text'],
    });
  }

  // Add failure details if any
  if (failed > 0) {
    attachments.push({
      color: '#dc3545',
      title: '❌ Failed Test Details',
      text: 'Review the failed tests above',
      mrkdwn_in: ['text'],
    });

    // Add screenshot info if available
    if (Object.keys(screenshots).length > 0) {
      let screenshotText = '*📸 Screenshots Available:*\n';
      for (const [testName, files] of Object.entries(screenshots)) {
        screenshotText += `\n📹 *${testName}*\n`;
        files.forEach(file => {
          screenshotText += `   • ${file}\n`;
        });
      }

      attachments.push({
        color: '#FFA500',
        title: '📸 Screenshot Evidence',
        text: screenshotText,
        footer: 'Check cypress/screenshots folder for full details',
        mrkdwn_in: ['text'],
      });
    }
  }

  // Add success celebration if all passed
  if (isAllPassed) {
    attachments.push({
      color: '#36a64f',
      title: '🏆 Excellent Work!',
      text: '🎊 All tests passed successfully! Keep up the great work! 💪',
      mrkdwn_in: ['text'],
    });
  }

  const message = { attachments };

  try {
    await axios.post(SLACK_WEBHOOK_URL, message);
    console.log('✅ Slack notification sent successfully!');
  } catch (error) {
    console.error('❌ Error sending Slack notification:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  sendSlackNotification();
}

module.exports = { sendSlackNotification };
