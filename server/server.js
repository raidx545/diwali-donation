const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const CSV_FILE_PATH = path.join(__dirname, 'donations.csv');

async function initializeCSV() {
  try {
    await fs.access(CSV_FILE_PATH);
    console.log('✅ CSV file found');
  } catch {
    const headers = 'id,name,amount,date,location,paymentId,email\n';
    await fs.writeFile(CSV_FILE_PATH, headers);
    console.log('✅ CSV file created with headers');
  }
}

app.get('/api/donations', async (req, res) => {
  try {
    const csvText = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    const lines = csvText.trim().split('\n');
    const donations = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      if (values.length >= 5) {
        donations.push({
          id: parseInt(values[0]) || i,
          name: values[1] || '',
          amount: parseFloat(values[2]) || 0,
          date: values[3] || '',
          location: values[4] || '',
          paymentId: values[5] || '',
          email: values[6] || ''
        });
      }
    }
    
    console.log(`📊 Fetched ${donations.length} donations`);
    res.json({ success: true, donations });
  } catch (error) {
    console.error('❌ Error reading CSV:', error);
    res.status(500).json({ success: false, error: 'Failed to read donations' });
  }
});

app.post('/api/donations', async (req, res) => {
  try {
    const { id, name, amount, date, location, paymentId, email } = req.body;
    
    if (!name || !amount || !date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    const sanitize = (val) => val ? val.toString().replace(/,/g, ';') : '';
    const newRow = `${id},${sanitize(name)},${amount},${date},${sanitize(location)},${sanitize(paymentId)},${sanitize(email)}`;
    
    await fs.appendFile(CSV_FILE_PATH, newRow + '\n');
    
    console.log('💾 Donation saved:', { id, name, amount });
    res.json({ success: true, message: 'Donation saved successfully' });
  } catch (error) {
    console.error('❌ Error saving donation:', error);
    res.status(500).json({ success: false, error: 'Failed to save donation' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

async function startServer() {
  await initializeCSV();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/donations`);
    console.log(`   POST http://localhost:${PORT}/api/donations\n`);
  });
}

startServer();