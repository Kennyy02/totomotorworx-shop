// server.js (for the frontend service)
const express = require('express');
const path = require('path');
const app = express();
// Use the PORT environment variable provided by Railway, or fallback to 8080 
// (though Railway's variable should always be used)
const port = process.env.PORT || 8080; 

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Any request that isn't for a static file should return index.html
// This is essential for single-page applications (SPAs) like React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Frontend server is running on port ${port}`);
});