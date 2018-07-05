import micro from "micro";
import microPino from "micro-pino";
import pino from "pino";
import { handler } from "./route";
import { createScraper } from "./scrape";

const pretty = pino.pretty().pipe(process.stdout);
const appLogger = pino(pretty);

const server = (scraper, logger) => {
  const service = handler(scraper);
  const instance = microPino(logger)(service);
  return micro(instance);
};

let chrome;

createScraper()
  .then(scraper => {
    chrome = scraper;
    server(scraper, appLogger).listen(process.env.PORT || 3000);
    appLogger.info("server started");
  })
  .catch(err => {
    if (err) throw err;
  });

process.on("SIGINT", () => {
  chrome.exit().then(() => appLogger.info("chrome exit"));
});

process.on("SIGTERM", () => {
  chrome.exit().then(() => appLogger.info("chrome exit"));
});
