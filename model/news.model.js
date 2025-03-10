const db = require("../db/connection");

exports.fetchAllTopics = () => {
  return db.query(`SELECT slug, description  FROM topics`).then(({ rows }) => {
    return rows;
  });
};
exports.fetchOneArticle = (article_id) => {
  return db
    .query(
      `SELECT author, title, article_id, body, topic, created_at, votes, article_img_url 
       FROM articles 
       WHERE article_id = $1`,
      [article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
