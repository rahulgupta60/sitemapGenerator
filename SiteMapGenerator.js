const cheerio = require('cheerio');
// const URL = require('url-parse');
const axios = require('axios');
const rauhl = require('url');
const { stripTrailingSlash, linkValidator } = require('./utils');

const MAX_PAGES_TO_VISIT = process.env.MAX_PAGE_VISIT || 2;
const NOT_ALLOWED_PROTOCOL = ['mailto:', 'ftp:'];
class SiteMapGenerator {
  constructor(link) {
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.pagesToVisit = [];
    const cleanUrl = stripTrailingSlash(link);
    const url = rauhl.parse(cleanUrl);
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
        await this.crawl();
      } else {
        await this.visitPage(nextPage);
      }
    }
    return this.response();
  }

  async visitPage(url) {
    this.pagesVisited[url] = true; //making sure page is visited
    this.numPagesVisited++;
    return axios
      .get(url)
      .then(async response => {
        if (response.status !== 200) {
          // may be page not found but keep crawling
          await this.crawl();
        }
        const $ = cheerio.load(response.data); // Parse the document body
        this.getPageLinks($);
        await this.crawl();
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  }

  getPageLinks($) {
    const visitedList = Object.keys(this.pagesVisited);

    const links = $('a');
    $(links).each((i, value) => {
      // const link = new URL($(value).attr('href'));

      const link1 = rauhl.parse($(value).attr('href'), true);
      const cleanUrl = stripTrailingSlash(link1.pathname);
      const newLink = this.baseUrl + '/' + cleanUrl;

      const linkValidatorFlag = linkValidator(
        link1,
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
