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
      console.log('TCL: string', string);
      const { url } = JSON.parse(string);

      // const fileName = sitemapGenerator(url);
      siteMapGenerator.getData(url);
      // console.log('TCL: fileName', fileName);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ response: url }));
    });
  }
});

const server = app.listen(port, function() {
  console.log(`API listen at port ${port}`);
});

module.exports = server;
