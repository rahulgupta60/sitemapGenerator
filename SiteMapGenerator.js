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
    this.baseUrl = '';
    // this.baseUrl = 'https://wiprodigital.com';
    // this.baseUrl = 'http://localhost:5500/';
  }

  async getData(START_URL) {
    const cleanUrl = this.stripTrailingSlash(START_URL);
    // const cleanUrl = this.baseUrl;

    const url = new URL(cleanUrl);
    this.baseUrl = url.protocol + '//' + url.hostname;
    this.pagesToVisit.push(cleanUrl);
    return await this.crawl();
  }

  async crawl() {
    if (this.numPagesVisited >= MAX_PAGES_TO_VISIT) {
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

    return new Promise((resolve, reject) => {
      console.log('TCL: SiteMapGenerator -> visitPage -> url', url);
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
  domainValidate({ hostname }) {
    // assuming it is relative link always true
    if (hostname) {
      const x = this.baseUrl.search(hostname) > 0 ? true : false;

      return x;
    }
    return true;
  }
  stripTrailingSlash(str) {
    return str.replace(/^\/|\/$/g, '');
  }
  filterOtherProtocaLL({ protocol }) {
    console.log('protocol', protocol);
    const x = !['mailto:', 'ftp:'].filter(x => x == protocol).length;
    console.log('flag', x);
    return x;
  }
  collectInternalLinks($) {
    //firer for other domain
    const pagesVisited = Object.entries(this.pagesVisited);
    const links = $('a');
    $(links).each((i, link) => {
      const url = new URL($(link).attr('href'));
      console.log('herf', $(link).attr('href'));

      const flag = this.domainValidate(url) && this.filterOtherProtocaLL(url);

      const newPagesToVisit =
        this.baseUrl + '/' + this.stripTrailingSlash(url.pathname);
      // console.log(' newPagesToVisit', newPagesToVisit);

      flag &&
        !this.pagesToVisit.includes(newPagesToVisit) &&
        !pagesVisited.includes(newPagesToVisit) &&
        this.pagesToVisit.push(newPagesToVisit);
    });
  }
}

module.exports = new SiteMapGenerator();
