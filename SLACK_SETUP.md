# Cypress Test Reporting & Slack Integration Guide

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Slack Webhook

1. Go to your Slack workspace
2. Navigate to: https://api.slack.com/apps
3. Click "Create New App" → "From scratch"
4. Name it (e.g., "Cypress Test Bot")
5. Select your workspace
6. Go to "Incoming Webhooks" → Enable it
7. Click "Add New Webhook to Workspace"
8. Select the channel where you want test reports
9. Copy the webhook URL

### 3. Set Environment Variable

Create a `.env` file in the project root:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Or set it globally (Windows PowerShell):
```powershell
$env:SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

Or (Windows CMD):
```cmd
set SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 4. Run Tests with Reporting

**Run all tests with video recording:**
```bash
npm run test
```

**Run specific test suite:**
```bash
npm run test:employer
npm run test:employee
```

**Run tests and send Slack notification:**
```bash
npm run test:with-report
```

**Just send Slack notification (if tests already ran):**
```bash
npm run notify:slack
```

## What Gets Generated

### Artifacts:
- **Videos**: `cypress/videos/` - Full test recordings
- **Screenshots**: `cypress/screenshots/` - Failure screenshots
- **Reports**: `cypress/reports/` - JSON and HTML reports
- **Final Report**: `cypress/reports/final-report/` - Merged and styled report

### Slack Notification Shows:
- ✅ Pass status (green = all passed, red = failures)
- Total tests count
- Passed/Failed/Pending breakdown
- Pass rate percentage

## File Structure
```
slack-notify.js          - Slack notification script
cypress.config.js        - Updated with video & mochawesome reporter
package.json            - Updated with scripts and dependencies
.env.example            - Example environment variables
```

## Troubleshooting

**Slack notifications not sending?**
- Check `SLACK_WEBHOOK_URL` environment variable is set
- Verify webhook URL is correct
- Check the Slack channel permissions

**Videos not recording?**
- Make sure `video: true` in cypress.config.js
- Check `videosFolder` path exists
- Ensure sufficient disk space

**Reports not generating?**
- Run `npm run report:merge` to merge multiple reports
- Run `npm run report:generate` to create styled HTML report

## Running in CI/CD

For GitHub Actions:
```yaml
- name: Run Cypress Tests
  run: npm run test:with-report
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

For Jenkins:
```bash
#!/bin/bash
export SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL
npm run test:with-report
```
