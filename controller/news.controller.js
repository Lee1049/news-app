const { fetchApiEndpoints } = require("../model/news.model");

exports.getApiEndpoints = (req, res, next) => {
  fetchApiEndpoints()
    .then((endpoints) => {
      res.status(200).send({ endpoints });
    })
    .catch((err) => {
      next(err);
    });
};
