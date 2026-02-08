const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the reports directory
app.use(express.static(path.join(__dirname, 'cypress/reports')));

// Serve the HTML report
app.get('/', (req, res) => {
  const reportPath = path.join(__dirname, 'cypress/reports/cypresstest.html');
  
  if (fs.existsSync(reportPath)) {
    res.sendFile(reportPath);
  } else {
    res.send('<h1>Report not found. Please run tests first.</h1>');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Report server running at http://localhost:${PORT}`);
  console.log(`📊 View your report at: http://localhost:${PORT}`);
});
