const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');

const { stripTrailingSlash, linkValidator } = require('./utils');

const MAX_PAGES_TO_VISIT = process.env.MAX_PAGE_VISIT || 2;
const NOT_ALLOWED_PROTOCOL = ['mailto:', 'ftp:'];
class SiteMapGenerator {
  constructor(link) {
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.pagesToVisit = [];
    const cleanUrl = stripTrailingSlash(link);
    const url = new URL(cleanUrl);
    this.baseUrl = url.protocol + '//' + url.hostname;
  }

  async get() {
    this.pagesToVisit.push(this.baseUrl);
    return await this.crawl();
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
          this.getInternalLinks($);
          resolve(this.crawl());
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  getInternalLinks($) {
    const visitedList = Object.keys(this.pagesVisited);

    const links = $('a');
    $(links).each((i, value) => {
      const link = new URL($(value).attr('href'));
      const newLink = this.baseUrl + '/' + stripTrailingSlash(link.pathname);

      const linkValidatorFlag = linkValidator(
        link,
        this.baseUrl,
        NOT_ALLOWED_PROTOCOL,
      );

      linkValidatorFlag && // check link is proper
      !this.pagesToVisit.includes(newLink) && // check link is already is exist in pagesToVisit list
      !visitedList.includes(newLink) && // check link is already is exist in visitedList list
        this.pagesToVisit.push(newLink); // finally push the data in pagesToVisit list
    });
  }
}

module.exports = SiteMapGenerator;
