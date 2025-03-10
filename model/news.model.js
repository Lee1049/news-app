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

exports.fetchAllTopics = () => {
  return db
    .query(`SELECT slug, description  FROM topics`)
    .then(({ rows }) => {
      return rows;
    })
    .catch((err) => {
      next(err);
    });
};
