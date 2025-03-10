const { fetchApiEndpoints, fetchAllTopics } = require("../model/news.model");

exports.getApiEndpoints = (req, res, next) => {
  fetchApiEndpoints()
    .then((endpoints) => {
      res.status(200).send({ endpoints });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllTopics = (req, res, next) => {
  fetchAllTopics()
    .then((topics) => {
      if (topics.length === 0) {
        return res.status(404).send({ msg: "Unable to find topics" });
      }
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};
