import qs from "querystring";
import cheerio from "cheerio";
import puppeteer from "puppeteer";
import { PendingXHR } from "pending-xhr-puppeteer";

const BASE = "https://books.google.com/talktobooks/query";

export const setURL = q => `${BASE}?${qs.stringify({ q })}`;

export const getResult = content => {
  const $ = cheerio.load(content);
  const cards = $(".result-card")
    .map((cardIdx, el) => {
      const html = $(el).html();
      const card = cheerio.load(html);
      const snippet = card(".snippet")
        .text()
        .trim();
      const highlight = card(".highlight")
        .text()
        .trim();
      const link = card(".view-link").attr("href");
      const book = card(".title").text();
      const [author, publisher, year] = card(".author")
        .map((authorIdx, info) =>
          card(info)
            .text()
            .trim()
        )
        .get();
      if (!author) {
        return {};
      }
      return {
        snippet,
        link,
        highlight,
        author,
        book,
        publisher,
        year
      };
    })
    .get();
  return cards;
};
const waitForLoading = async page => {
  const content = await page.content();
  const res = getResult(content);
  const empty = res.filter(card => !card.author);
  if (empty.length === 0) {
    return res;
  }
  await page.close();
  return waitForLoading(page);
};

export const scrape = browser => async (
  url,
  { waitFor = null, clicks = [] }
) => {
  const page = await browser.newPage();
  const pendingXHR = new PendingXHR(page);
  await page.goto(url);
  if (waitFor) {
    await page.waitForSelector(waitFor);
  }
  const waitAndClick = click =>
    Promise.all([page.waitForSelector(click), page.click(click)]);
  await Promise.all(clicks.map(waitAndClick));
  await pendingXHR.waitForAllXhrFinished();
  return waitForLoading(page);
};

class Scraper {
  constructor(browser) {
    this.browser = browser;
    this.get = scrape(browser);
  }

  async query({ q, waitFor = null, clicks = [] }) {
    const url = setURL(q);
    return this.get(url, { waitFor, clicks });
  }

  async exit() {
    await this.browser.close();
  }
}

export const createScraper = async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  return new Scraper(browser);
};
