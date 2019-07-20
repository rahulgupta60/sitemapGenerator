const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');

// const MAX_PAGES_TO_VISIT = 10;
const MAX_PAGES_TO_VISIT = 2;
class SiteMapGenerator {
  constructor() {
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.pagesToVisit = [];
    this.finalResult = [];
    // this.baseUrl = '';
    this.baseUrl = 'https://wiprodigital.com';
  }

  async getData(START_URL) {
    const url = new URL(START_URL);
    // this.baseUrl = url.protocol + '//' + url.hostname;
    // this.pagesToVisit.push(START_URL);
    this.pagesToVisit.push(this.baseUrl);
    return await this.crawl();
  }

  async crawl() {
    if (this.numPagesVisited >= MAX_PAGES_TO_VISIT) {
      console.log('Reached max limit of number of pages to visit.');
      return {
        pagesVisited: this.pagesVisited,
        pagesToVisit: this.pagesToVisit,
      };
    }
    const nextPage = this.pagesToVisit.length && this.pagesToVisit.pop();
    if (!!nextPage) {
      if (nextPage in this.pagesVisited) {
        return await this.crawl();
      } else {
        return await this.visitPage(nextPage);
      }
    }
    return { pagesVisited: this.pagesVisited, pagesToVisit: this.pagesToVisit };
  }

  async visitPage(url) {
    this.pagesVisited[url] = true;
    this.numPagesVisited++;

    // Make the request
    console.log('Visiting page ' + url);
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        // in addition to parsing the value, deal with possible errors
        if (error) return reject(error);
        try {
          if (response.statusCode !== 200) {
            resolve(this.crawl());
          }
          // Parse the document body
          const $ = cheerio.load(body);

          this.collectInternalLinks($);
          // In this short program, our callback is just calling crawl()

          resolve(this.crawl());
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  collectInternalLinks($) {
    //firer for other domain
    const pagesVisited = Object.entries(this.pagesVisited);
    const links = $('a');
    $(links).each((i, link) => {
      const url = new URL($(link).attr('href'));
      const newPagesToVisit = this.baseUrl + url.pathname;
      !this.pagesToVisit.includes(newPagesToVisit) &&
        !pagesVisited.includes(newPagesToVisit) &&
        this.pagesToVisit.push(newPagesToVisit);
    });
  }
}

module.exports = new SiteMapGenerator();
