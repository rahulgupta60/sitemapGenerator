const http = require('http');
const fs = require('fs');

const siteMapGenerator = require('./SiteMapGenerator');
const PORT = process.env.PORT || 3000;

const app = http.createServer((req, res) => {
  if (req.method == 'POST') {
    let string = '';
    req.on('data', chunk => {
      string += chunk.toString();
    });
    req.on('end', () => {
      const { url } = JSON.parse(string);
      const siteMap = new siteMapGenerator(url);
      siteMap.get().then(data => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data }));
      });
    });
  }
});

const server = app.listen(PORT, function() {
  console.log(`API listen at port ${PORT}`);
});

module.exports = server;
