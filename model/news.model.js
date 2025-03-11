const db = require("../db/connection");

exports.fetchAllTopics = () => {
  return db.query(`SELECT slug, description  FROM topics`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchOneArticle = (article_id) => {
  if (isNaN(article_id)) {
    return Promise.reject({ status: 400, msg: "Invalid article ID" });
  }
  return db
    .query(
      `SELECT author, title, article_id, body, topic, created_at, votes, article_img_url 
       FROM articles 
       WHERE article_id = $1`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Unable to find the article",
        });
      }
      return rows[0];
    });
};

exports.fetchAllArticles = (sort_by = "created_at", order = "DESC", topic) => {
  const allowedSortColumns = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];
  if (!allowedSortColumns.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid sort query",
    });
  }

  const queryValues = [];
  let queryString = `
      SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
      COUNT(comments.article_id) AS comment_count
      FROM articles
      LEFT JOIN comments ON articles.article_id = comments.article_id
  `;

  if (topic) {
    queryString += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }

  queryString += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order};`;

  return db.query(queryString, queryValues).then(({ rows }) => {
    if (rows.length === 0 && topic) {
      return db
        .query("SELECT * FROM topics WHERE slug = $1", [topic])
        .then(({ rows }) => {
          if (rows.length === 0) {
            return Promise.reject({
              status: 404,
              msg: "Unable to find the topic",
            });
          } else {
            return rows;
          }
        });
    }
    return rows;
  });
};
