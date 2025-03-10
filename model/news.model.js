const db = require("../db/connection");
const fs = require("fs/promises");

exports.fetchApiEndpoints = () => {
  return fs
    .readFile("./endpoints.json", "utf-8")
    .then((data) => {
      return JSON.parse(data);
    })
    .catch((err) => {
      next(err);
    });
};
