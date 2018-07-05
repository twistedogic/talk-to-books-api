import fs from "fs";
import path from "path";
import to from "await-to-js";
import puppeteer from "puppeteer";
import { scrape, setURL, getResult, PUPPETEER_OPT } from "./scrape";

const fixture = path.resolve(__dirname, "fixture", "test.html");

describe("setURL", () => {
  it("should return talk to books url with query", () => {
    const input = "test this query";
    const expected =
      "https://books.google.com/talktobooks/query?q=test%20this%20query";
    const output = setURL(input);
    expect(output).toBe(expected);
  });
});

describe("getResult", () => {
  it("should return results", () => {
    const html = fs.readFileSync(fixture, "utf8");
    const res = getResult(html);
    res.forEach(r => {
      expect(r).toHaveProperty("snippet");
      expect(r).toHaveProperty("book");
      expect(r).toHaveProperty("author");
      expect(r).toHaveProperty("publisher");
    });
  });
});

describe("scrape", () => {
  let browser;
  beforeAll(async () => {
    const [err, res] = await to(puppeteer.launch(PUPPETEER_OPT));
    if (err) throw err;
    browser = res;
  });
  afterAll(async () => {
    await browser.close();
  });
  it(
    "should return html string",
    async () => {
      const url = setURL("who is donald trump");
      const opt = {
        waitFor: "#main-content",
        clicks: [".load-more-button", ".load-more-button"]
      };
      const client = scrape(browser);
      const [err, res] = await to(client(url, opt));
      expect(err).toBeNull();
      res.forEach(r => {
        expect(r).toHaveProperty("snippet");
        expect(r).toHaveProperty("book");
        expect(r).toHaveProperty("author");
        expect(r).toHaveProperty("publisher");
      });
    },
    50000
  );
});
