#!/bin/bash

echo "🚀 Setting up Donation Tracking Backend..."
echo ""

# Create server directory
echo "📁 Creating server directory..."
mkdir -p server
cd server

# Initialize package.json
echo "📦 Initializing Node.js project..."
npm init -y

# Install dependencies
echo "⬇️  Installing dependencies..."
npm install express cors
npm install --save-dev nodemon

# Update package.json scripts
echo "⚙️  Configuring scripts..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = {
  'start': 'node server.js',
  'dev': 'nodemon server.js'
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# Create server.js
echo "📝 Creating server.js..."
cat > server.js << 'EOF'
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
    
    console.log(\`📊 Fetched \${donations.length} donations\`);
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
    const newRow = \`\${id},\${sanitize(name)},\${amount},\${date},\${sanitize(location)},\${sanitize(paymentId)},\${sanitize(email)}\`;
    
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
    console.log(\`\n🚀 Server running on http://localhost:\${PORT}\`);
    console.log(\`📊 API endpoints:\`);
    console.log(\`   GET  http://localhost:\${PORT}/api/donations\`);
    console.log(\`   POST http://localhost:\${PORT}/api/donations\n\`);
  });
}

startServer();
EOF

# Create initial CSV file
echo "📄 Creating donations.csv..."
cat > donations.csv << 'EOF'
id,name,amount,date,location,paymentId,email
1,Rajesh Kumar,5000,2025-01-15,Mumbai,pay_sample001,rajesh@example.com
2,Priya Sharma,3000,2025-01-14,Delhi,pay_sample002,priya@example.com
3,Amit Patel,2500,2025-01-13,Bangalore,pay_sample003,amit@example.com
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the server:"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "The server will run on: http://localhost:3001"
echo ""
