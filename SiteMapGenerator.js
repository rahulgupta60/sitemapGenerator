const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');

const START_URL = 'https://wiprodigital.com/';
// const START_URL = 'http://127.0.0.1:5500/'
const MAX_PAGES_TO_VISIT = 10;

// module.exports.sitemapGenerator = START_URL => {};

class SiteMapGenerator {
  constructor() {
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.pagesToVisit = [];
    this.finalResult = [];
  }

  getData(START_URL) {
    const url = new URL(START_URL);
    this.baseUrl = url.protocol + '//' + url.hostname;
    this.pagesToVisit.push(START_URL);

    const x = this.crawl();
    console.log('TCL: x', x);

    return url;
  }

  crawl() {
    if (this.numPagesVisited >= MAX_PAGES_TO_VISIT) {
      console.log('Reached max limit of number of pages to visit.');
      console.log('finish', this.pagesVisited);
      console.log('need to visit', this.pagesToVisit);
      return this.pagesVisited;
    }

    const nextPage = this.pagesToVisit.length && this.pagesToVisit.pop();
    if (!!nextPage) {
      if (nextPage in this.pagesVisited) {
        // We've already visited this page, so repeat the crawl
        crawl();
      } else {
        // New page we haven't visited
        this.visitPage(nextPage, this.crawl);
      }
    }
    //  else {
    //   console.log('finish', pagesVisited);
    // }
    return this.pagesVisited;
  }

  visitPage(url, callback) {
    console.log('TCL: visitPage -> url', url);
    // Add page to our set
    this.pagesVisited[url] = true;
    this.numPagesVisited++;

    // Make the request
    console.log('Visiting page ' + url);
    request(url, (error, response, body) => {
      // Check status code (200 is HTTP OK)
      console.log('Status code: ' + response.statusCode);
      if (response.statusCode !== 200) {
        callback();
        return;
      }
      // Parse the document body
      const $ = cheerio.load(body);

      this.collectInternalLinks($);
      // In this short program, our callback is just calling crawl()
      callback();
    });
  }

  collectInternalLinks($) {
    const links = $('a');
    console.log('Found ' + links.length + ' relative links on page');
    $(links).each((i, link) => {
      const url = new URL($(link).attr('href'));
      this.pagesToVisit.push(this.baseUrl + url.pathname);
    });
  }
}

module.exports = new SiteMapGenerator();
