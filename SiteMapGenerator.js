const url = require('url');
const cheerio = require('cheerio');
const axios = require('axios');

const { stripTrailingSlash, linkValidator } = require('./utils');

const MAX_PAGES_TO_VISIT = process.env.MAX_PAGE_VISIT || 2;
const NOT_ALLOWED_PROTOCOL = ['mailto:', 'ftp:'];

class SiteMapGenerator {
  constructor(link) {
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.pagesToVisit = [];
    const cleanUrl = stripTrailingSlash(link);
    const urlObject = url.parse(cleanUrl);
    this.baseUrl = urlObject.protocol + '//' + urlObject.hostname;
  }

  get() {
    this.pagesToVisit.push(this.baseUrl);
    return this.crawl();
  }

  response() {
    const visitedList = Object.keys(this.pagesVisited);
    return {
      siteMapResponse: [...visitedList, ...this.pagesToVisit],
      totalPageVisited: this.numPagesVisited,
      totalPageVisitedList: this.pagesVisited,
      pendingToVisitList: this.pagesToVisit,
    };
  }

  async crawl() {
    if (this.numPagesVisited >= MAX_PAGES_TO_VISIT) {
      return this.response();
    }
    const nextPage = this.pagesToVisit.length && this.pagesToVisit.pop();
    if (!!nextPage) {
      if (nextPage in this.pagesVisited) {
        this.crawl();
      } else {
        await this.visitPage(nextPage);
      }
    }
    return this.response();
  }

  async visitPage(url) {
    this.pagesVisited[url] = true; //making sure page is visited
    this.numPagesVisited++;

    axios
      .get(url)
      .then(async response => {
        console.log(' url', url);
        console.log('response.status', response.status);
        if (response.status !== 200) {
          // may be page not found but keep crawling
          await this.crawl();
        }
        const $ = cheerio.load(response.data); // Parse the document body
        this.getPageLinks($);
        await this.crawl();
      })
      .catch(async error => {
        // may be page not found but keep crawling
        console.log(error);
        await this.crawl();
      });
  }

  getPageLinks($) {
    const visitedList = Object.keys(this.pagesVisited);

    const links = $('a');
    $(links).each((i, value) => {
      const link = url.parse($(value).attr('href'), true);

      const cleanUrl = link.pathname
        ? stripTrailingSlash(link.pathname)
        : false;

      const newLink = this.baseUrl + '/' + cleanUrl;

      const linkValidatorFlag = linkValidator(
        link,
        this.baseUrl,
        NOT_ALLOWED_PROTOCOL,
      );

      cleanUrl && // if only slash contain url is fail
      linkValidatorFlag && // check newLink is proper
      !this.pagesToVisit.includes(newLink) && // check newLink is already is exist in pagesToVisit list
      !visitedList.includes(newLink) && // check newLink is already is exist in visitedList list
        this.pagesToVisit.push(newLink); // finally push the data in pagesToVisit list
    });
  }
}

module.exports = SiteMapGenerator;
