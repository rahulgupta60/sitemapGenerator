// var request = require('request');
// var cheerio = require('cheerio');
// var URL = require('url-parse');

// // var START_URL = "http://www.arstechnica.com";
// var START_URL = 'https://wiprodigital.com/'
// // var START_URL = 'http://127.0.0.1:5500/'
// var MAX_PAGES_TO_VISIT = 10;

// var pagesVisited = {};
// var numPagesVisited = 0;
// var pagesToVisit = [];
// var url = new URL(START_URL);
// var baseUrl = url.protocol + "//" + url.hostname;

// // var baseUrl = START_URL;   

// const finalResult = []
// pagesToVisit.push(START_URL);
// crawl();

// function crawl() {
//   if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
//     console.log("Reached max limit of number of pages to visit.");
//     console.log('finish', pagesVisited);
//     console.log('need to visit', pagesToVisit)
//     return;
//   }
//   console.log('TCL: crawl -> pagesToVisit', pagesToVisit.length);
//   var nextPage = pagesToVisit.length && pagesToVisit.pop();
//   console.log('TCL: crawl -> nextPage', nextPage);
//   if (!!nextPage) {
//     if (nextPage in pagesVisited) {
//       // We've already visited this page, so repeat the crawl
//       crawl();
//     } else {
//       // New page we haven't visited
//       visitPage(nextPage, crawl);
//     }
//   } else {
//     console.log('finish', pagesVisited);
//   }
// }

// function visitPage(url, callback) {
//   console.log('TCL: visitPage -> url', url);
//   // Add page to our set
//   pagesVisited[url] = true;
//   numPagesVisited++;

//   // Make the request
//   console.log("Visiting page " + url);
//   request(url, function (error, response, body) {
//     // Check status code (200 is HTTP OK)
//     console.log("Status code: " + response.statusCode);
//     if (response.statusCode !== 200) {
//       callback();
//       return;
//     }
//     // Parse the document body
//     var $ = cheerio.load(body);

//     collectInternalLinks($);
//     // In this short program, our callback is just calling crawl()
//     callback();
//   });
// }


// function collectInternalLinks($) {
//   const links = $('a');
//   console.log("Found " + links.length + " relative links on page");
//   $(links).each(function (i, link) {
//     const url = new URL($(link).attr('href'));
//     pagesToVisit.push(baseUrl + url.pathname);
//   });
// }

module.exports.sitemapGenerator = (url) => {
  console.log('TCL: module.exports.sitemapGenerator -> url', url);
  // const fileName = `${uniqueId}.json`
  // fs.writeFile(fileName, data, function (err) {
  //   if (err) { throw `error:${err}` }
  // });
  return url
}
