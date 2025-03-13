const express = require("express");
const {
  getApiEndpoints,
  getAllTopics,
  getOneArticle,
  getAllArticles,
  getArticleComments,
  createCommentForArticle,
  updateArticleVotes,
  deleteCommentById,
  getAllUsers,
} = require("./controller/news.controller");
const { causeInternalServerError } = require("./controller/error.controller");

const app = express();

app.use(express.json());

app.get("/api", getApiEndpoints);

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id", getOneArticle);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", createCommentForArticle);

app.patch("/api/articles/:article_id", updateArticleVotes);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.get("/api/users", getAllUsers);

app.get("/api/trigger-500-error", causeInternalServerError);

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid comment ID" });
  } else if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
