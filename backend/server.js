const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Survey Swap API' });
});

// Example API route
app.get('/api/surveys', (req, res) => {
  res.json({
    surveys: [
      { id: 1, title: 'Sample Survey 1', description: 'This is a test survey' },
      { id: 2, title: 'Sample Survey 2', description: 'Another test survey' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
