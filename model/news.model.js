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

exports.fetchAllArticles = () => {
  return db
    .query(
      `
      SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
      COUNT(comments.article_id) AS comment_count
      FROM articles
      LEFT JOIN comments ON articles.article_id = comments.article_id
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;
      `
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "No articles found",
        });
      }
      return rows;
    });
};

exports.fetchArticleComments = (article_id) => {
  if (isNaN(article_id)) {
    return Promise.reject({ status: 400, msg: "Invalid article ID" });
  }

  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Unable to find the article",
        });
      }

      return db.query(
        `
        SELECT comment_id, article_id, body, votes, author, created_at  
        FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC;
        `,
        [article_id]
      );
    })
    .then(({ rows }) => {
      return rows;
    });
};

exports.postCommentForArticle = (article_id, author, body) => {
  if (isNaN(article_id)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid article ID",
    });
  }

  if (!author || !body) {
    return Promise.reject({
      status: 400,
      msg: "Missing the required author or body",
    });
  }

  return db
    .query("SELECT * FROM users WHERE username = $1", [author])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "User not found",
        });
      }

      return db
        .query(
          `INSERT INTO comments (article_id, author, body)
        VALUES ($1, $2, $3)
        RETURNING comment_id, article_id, body, votes, author, created_at`,
          [article_id, author, body]
        )
        .then(({ rows }) => {
          return rows[0];
        });
    });
};

exports.updateVotesByArticleId = (article_id, inc_votes) => {
  if (typeof inc_votes !== "number") {
    return Promise.reject({
      status: 400,
      msg: "Invalid: votes must be a number",
    });
  }

  return db
    .query(
      `UPDATE articles
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Article not found",
        });
      }
      return rows[0];
    });
};

exports.removeCommentById = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};
