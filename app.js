const express = require("express");
const {
  getApiEndpoints,
  getAllTopics,
  getOneArticle,
} = require("./controller/news.controller");
const { causeInternalServerError } = require("./controller/error.controller");

const app = express();

app.use(express.json());

app.get("/api", getApiEndpoints);

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id", getOneArticle);

app.get("/api/errorpathway", causeInternalServerError);

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});
module.exports = app;
