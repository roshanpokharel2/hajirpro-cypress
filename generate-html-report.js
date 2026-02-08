const fs = require('fs');
const path = require('path');

// Load .env file if it exists
if (fs.existsSync(path.join(__dirname, '.env'))) {
  require('dotenv').config();
}

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

  const filesWithTime = files.map(file => {
    const filePath = path.join(reportsDir, file);
    const stats = fs.statSync(filePath);
    return {
      name: file,
      time: stats.mtimeMs
    };
  }).sort((a, b) => b.time - a.time);

  const timeBatch = [];
  const batchThreshold = 60000;
  
  if (filesWithTime.length > 0) {
    const mostRecentTime = filesWithTime[0].time;
    
    for (const file of filesWithTime) {
      if (mostRecentTime - file.time <= batchThreshold) {
        timeBatch.push(file.name);
      }
    }
  }

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
    }
  });

  return mergedReport;
}

// Generate HTML Report
function generateHtmlReport() {
  const report = getLatestReport();
  
  if (!report) {
    console.log('❌ No test report found');
    return;
  }

  const stats = report.stats;
  const passed = stats.passes || 0;
  const failed = stats.failures || 0;
  const pending = stats.pending || 0;
  const total = stats.tests || 0;
  const duration = stats.duration || 0;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
  const isAllPassed = failed === 0 && total > 0;

  // Build test cases HTML
  let testsHtml = '';
  
  function buildTestsHtml(suites, level = 0) {
    let html = '';
    suites.forEach(suite => {
      const indent = level * 20;
      html += `<div style="margin-left: ${indent}px; margin-bottom: 15px;">`;
      html += `<div style="font-weight: bold; color: #333; font-size: 16px; margin-bottom: 10px;">📁 ${suite.title}</div>`;
      
      if (suite.tests && suite.tests.length > 0) {
        suite.tests.forEach(test => {
          const icon = test.state === 'passed' ? '✅' : test.state === 'failed' ? '❌' : '⏳';
          const statusColor = test.state === 'passed' ? '#28a745' : test.state === 'failed' ? '#dc3545' : '#ffc107';
          const duration = test.duration ? `${test.duration}ms` : 'N/A';
          
          html += `<div style="margin-left: 20px; margin-bottom: 8px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid ${statusColor};">`;
          html += `<div style="color: ${statusColor}; font-weight: 600;">${icon} ${test.title}</div>`;
          html += `<div style="color: #666; font-size: 12px; margin-top: 5px;">Duration: ${duration}</div>`;
          
          if (test.state === 'failed' && test.err) {
            html += `<div style="color: #dc3545; font-size: 12px; margin-top: 5px; font-family: monospace;">Error: ${test.err.message}</div>`;
          }
          html += `</div>`;
        });
      }
      
      if (suite.suites && suite.suites.length > 0) {
        html += buildTestsHtml(suite.suites, level + 1);
      }
      
      html += `</div>`;
    });
    return html;
  }

  testsHtml = buildTestsHtml(report.suites);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cypress Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header-subtitle {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .celebration {
            font-size: 3em;
            margin: 20px 0;
            animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        
        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-top: 4px solid #667eea;
        }
        
        .stat-card.passed {
            border-top-color: #28a745;
        }
        
        .stat-card.failed {
            border-top-color: #dc3545;
        }
        
        .stat-card.pending {
            border-top-color: #ffc107;
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #333;
            margin: 10px 0;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.95em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-card.passed .stat-number {
            color: #28a745;
        }
        
        .stat-card.failed .stat-number {
            color: #dc3545;
        }
        
        .stat-card.pending .stat-number {
            color: #ffc107;
        }
        
        .content {
            padding: 40px;
        }
        
        .section-title {
            font-size: 1.8em;
            color: #333;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 3px solid #667eea;
        }
        
        .test-item {
            margin-bottom: 15px;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px 40px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #e0e0e0;
        }
        
        .success-badge {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            margin: 20px 0;
            font-weight: 600;
        }
        
        .failure-badge {
            display: inline-block;
            background: #dc3545;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            margin: 20px 0;
            font-weight: 600;
        }
        
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e0e0e0;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Cypress Test Report</h1>
            ${isAllPassed ? '<div class="celebration">🎉 🚀</div>' : '<div class="celebration">⚠️</div>'}
            <div class="header-subtitle">
                ${isAllPassed ? 'Congrats QA[ Roshan Daju & Suraksha Diju ] you did it!' : 'Test Run Summary'}
            </div>
        </div>
        
        <div class="stats-container">
            <div class="stat-card">
                <div class="stat-label">Total Tests</div>
                <div class="stat-number">${total}</div>
            </div>
            
            <div class="stat-card passed">
                <div class="stat-label">✅ Passed</div>
                <div class="stat-number">${passed}</div>
            </div>
            
            <div class="stat-card failed">
                <div class="stat-label">❌ Failed</div>
                <div class="stat-number">${failed}</div>
            </div>
            
            <div class="stat-card pending">
                <div class="stat-label">⏳ Pending</div>
                <div class="stat-number">${pending}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">📊 Pass Rate</div>
                <div class="stat-number">${passRate}%</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">⏱️ Duration</div>
                <div class="stat-number">${(duration / 1000).toFixed(2)}s</div>
            </div>
        </div>
        
        <div class="content">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${passRate}%;">
                    ${passRate}%
                </div>
            </div>
            
            ${isAllPassed ? '<div class="success-badge">✅ All Tests Passed!</div>' : '<div class="failure-badge">❌ Some Tests Failed</div>'}
            
            <h2 class="section-title">📋 Test Results</h2>
            <div class="test-item">
                ${testsHtml}
            </div>
        </div>
        
        <div class="footer">
            <p>Generated by Cypress Test Automation | ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
`;

  const reportPath = path.join(__dirname, 'cypress/reports/cypresstest.html');
  fs.writeFileSync(reportPath, htmlContent);
  console.log(`✅ HTML Report generated: ${reportPath}`);
  
  return reportPath;
}

// Export function
module.exports = { generateHtmlReport };

// Run if called directly
if (require.main === module) {
  generateHtmlReport();
}
