const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');

const MAX_PAGES_TO_VISIT = process.env.MAX_PAGE_VISIT || 10;
const NOT_ALLOWED_PROTOCOL = ['mailto:', 'ftp:'];

class SiteMapGenerator {
  constructor() {
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.pagesToVisit = [];
    this.finalResult = [];
    this.baseUrl = '';
    console.log('numPagesVisited', this.numPagesVisited);
    console.log('pagesVisited', this.pagesVisited);
    // this.baseUrl = 'http://localhost:5500/';
  }

  async getData(START_URL) {
    const cleanUrl = this.stripTrailingSlash(START_URL);
    const url = new URL(cleanUrl);
    this.baseUrl = url.protocol + '//' + url.hostname;
    this.pagesToVisit.push(cleanUrl);

    return await this.crawl();
  }

  response() {
    const visitedList = Object.keys(this.pagesVisited);
    const output = {
      siteMapResponse: [...visitedList, ...this.pagesToVisit],
      pagesVisited: this.pagesVisited,
      pagesToVisit: this.pagesToVisit,
    };
    // this.pagesVisited = {};
    // this.pagesToVisit = [];
    return output;
  }

  async crawl() {
    if (this.numPagesVisited >= MAX_PAGES_TO_VISIT) {
      return this.response();
    }
    const nextPage = this.pagesToVisit.length && this.pagesToVisit.pop();
    if (!!nextPage) {
      if (nextPage in this.pagesVisited) {
        return await this.crawl();
      } else {
        return await this.visitPage(nextPage);
      }
    }
    return this.response();
  }

  async visitPage(url) {
    this.pagesVisited[url] = true; //making sure page is visited
    this.numPagesVisited++;

    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        // in addition to parsing the value, deal with possible errors
        if (error) return reject(error);
        try {
          if (response.statusCode !== 200) {
            resolve(this.crawl());
          }
          const $ = cheerio.load(body); // Parse the document body
          this.collectInternalLinks($);
          resolve(this.crawl());
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  domainValidate({ hostname }) {
    // assuming it is relative link always true
    if (hostname) {
      return this.baseUrl.search(hostname) > 0 ? true : false;
    }
    return true;
  }

  collectInternalLinks($) {
    //firer for other domain
    const visitedList = Object.keys(this.pagesVisited);

    const links = $('a');
    $(links).each((i, link) => {
      const url = new URL($(link).attr('href'));
      const newPagesToVisit =
        this.baseUrl + '/' + this.stripTrailingSlash(url.pathname);

      const flag = this.domainValidate(url) && this.filterProtocol(url);

      flag &&
        !this.pagesToVisit.includes(newPagesToVisit) &&
        !visitedList.includes(newPagesToVisit) &&
        this.pagesToVisit.push(newPagesToVisit);
    });
  }

  stripTrailingSlash(url) {
    return url.replace(/^\/|\/$/g, '');
  }

  filterProtocol({ protocol }) {
    return !NOT_ALLOWED_PROTOCOL.filter(x => x == protocol).length;
  }
}

module.exports = new SiteMapGenerator();
