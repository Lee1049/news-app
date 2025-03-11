const { fetchAllTopics, fetchOneArticle } = require("../model/news.model");

const endpointsJson = require("../endpoints.json");

exports.getApiEndpoints = (req, res, next) => {
  res.status(200).send({ endpoints: endpointsJson });
};

exports.getAllTopics = (req, res, next) => {
  fetchAllTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getOneArticle = (req, res, next) => {
  const { article_id } = req.params;

  fetchOneArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
