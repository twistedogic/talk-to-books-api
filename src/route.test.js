import listen from "test-listen";
import got from "got";
import micro from "micro";
import { addClicks, handler } from "./route";
import { createScraper } from "./scrape";

describe("addClicks", () => {
  it("should return load more button class", () => {
    const input = 2;
    const expected = [".load-more-button", ".load-more-button"];
    const output = addClicks(input);
    expect(output).toMatchObject(expected);
  });
});

describe("handler", () => {
  let chrome;
  let service;
  beforeAll(async () => {
    chrome = await createScraper();
    service = micro(handler(chrome));
  });
  afterAll(async () => {
    await chrome.exit();
    service.close();
  });
  it(
    "should return result",
    () =>
      listen(service)
        .then(url => {
          const uri = `${url}/?q=test nodejs`;
          return got(uri, {
            method: "GET",
            json: true
          });
        })
        .then(res => {
          const { body } = res;
          body.forEach(r => {
            expect(r).toHaveProperty("snippet");
            expect(r).toHaveProperty("book");
            expect(r).toHaveProperty("author");
            expect(r).toHaveProperty("publisher");
          });
        })
        .catch(err => {
          if (err) throw err;
        }),
    50000
  );
});
