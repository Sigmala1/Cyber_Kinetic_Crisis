const http = require('http');
const fs = require('fs');

const API_BASE_URL = process.env.COMPANY_API_URL || "https://company-stg.criticalasset.com";

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/devices' && req.method === 'GET') {
    let mockData = {};
    try {
      mockData = JSON.parse(fs.readFileSync('targon_rental_data.json', 'utf8'));
    } catch (e) {
      console.error("Failed to read targon_rental_data.json", e);
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      source: API_BASE_URL,
      data: mockData
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(8080, () => {
  console.log('Node mock API backend running on port 8080');
});
