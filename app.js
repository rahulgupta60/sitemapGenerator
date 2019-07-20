const http = require('http')
const fs = require('fs');

const { sitemapGenerator } = require('./utils')
const port = 3000 || process.env.port;
console.log('TCL: process.env.port;', process.env.port);

const app = http.createServer((req, res) => {
  if (req.method == 'POST') {
    let string = ''
    req.on('data', (chunk) => {
      string += chunk.toString()
    })
    req.on('end', () => {
      console.log('TCL: string', string);
      const { url } = JSON.parse(string)
      console.log('TCL: url', url);

      const fileName = sitemapGenerator(url);
      console.log('TCL: fileName', fileName);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 'response': url }));
    })
  }
})

const server = app.listen(process.env.PORT, function () {
  console.log("API listen at port 3000");
});

module.exports = server;