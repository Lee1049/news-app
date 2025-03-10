const express = require("express");
const {
  getApiEndpoints,
  getAllTopics,
} = require("./controller/news.controller");

const app = express();

app.use(express.json());

app.get("/api", getApiEndpoints);

app.get("/api/topics", getAllTopics);

app.use((err, req, res, next) => {
  // console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
});
module.exports = app;
