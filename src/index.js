import micro, { send } from "micro";
import { router, get } from "microrouter";
import { handleErrors, createError } from "micro-boom";
import Joi from "joi";
import microPino from "micro-pino";
import pino from "pino";
import { createScraper } from "./scrape";

const appLogger = pino({
  serializers: pino.stdSerializers
});

const querySchema = Joi.object({
  q: Joi.string().required(),
  page: Joi.number()
});

const defaults = {
  waitFor: "#main-content"
};

const addClicks = num => new Array(num).map(item => ".load-more-button"); // eslint-disable-line no-unused-vars

const talk = scraper =>
  handleErrors(async (req, res) => {
    const { query } = req;
    const { error } = Joi.validate(query, querySchema);
    if (error) throw createError(400, "Bad Request", error);
    const { q } = query;
    const page = query.page || 0;
    const clicks = addClicks(page);
    const data = await scraper.query(
      Object.assign({}, defaults, { q, clicks })
    );
    send(res, 200, data);
  });

const server = (scraper, logger) => {
  const handler = talk(scraper);
  const instance = microPino(logger)(router(get("/", handler)));
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
