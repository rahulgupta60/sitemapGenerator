const http = require('http');
const fs = require('fs');

const siteMapGenerator = require('./SiteMapGenerator');
const port = process.env.port || 3000;

const app = http.createServer((req, res) => {
  if (req.method == 'POST') {
    let string = '';
    req.on('data', chunk => {
      string += chunk.toString();
    });
    req.on('end', () => {
      const { url } = JSON.parse(string);

      siteMapGenerator.getData(url).then(data => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data }));
      });
    });
  }
});

const server = app.listen(port, function() {
  console.log(`API listen at port ${port}`);
});

module.exports = server;
