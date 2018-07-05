import { send } from "micro";
import { router, get } from "microrouter";
import Joi from "joi";

const querySchema = Joi.object({
  q: Joi.string().required(),
  page: Joi.number()
});

const defaults = {
  waitFor: "#main-content"
};

export const addClicks = num =>
  Array.from(Array(num)).map(() => ".load-more-button"); // eslint-disable-line no-unused-vars

export const handler = scraper =>
  router(
    get("/", async (req, res) => {
      const { query } = req;
      const { error } = Joi.validate(query, querySchema);
      if (error) throw error;
      const { q } = query;
      const page = query.page || 0;
      const clicks = addClicks(page);
      const data = await scraper.query(
        Object.assign({}, defaults, { q, clicks })
      );
      send(res, 200, data);
    })
  );
