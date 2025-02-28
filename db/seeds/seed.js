const db = require("../connection");
const { convertTimestampToDate } = require("../seeds/utils");
const format = require("pg-format");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query("DROP TABLE IF EXISTS comments;")
    .then(() => {
      return db.query("DROP TABLE IF EXISTS articles;");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS users;");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS topics;");
    })
    .then(() => {
      return createTopics();
    })
    .then(() => {
      return createUsers();
    })
    .then(() => {
      return createArticles();
    })
    .then(() => {
      return createComments();
    });

  function createTopics() {
    const query = `CREATE TABLE topics (
    slug VARCHAR(100) PRIMARY KEY,
    description VARCHAR(100),
    img_url VARCHAR(1000)
    );`;
    return db.query(query).then(() => {
      const formattedTopics = topicData.map(
        ({ slug, description, img_url }) => [slug, description, img_url]
      );
      const topicQuery = format(
        `
          INSERT INTO topics (slug, description, img_url)
          VALUES %L
          RETURNING *
        `,
        formattedTopics
      );
      return db.query(topicQuery);
    });
  }

  function createUsers() {
    const query = `CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(1000)
    );`;
    return db.query(query).then(() => {
      const formattedUser = userData.map(({ username, name, avatar_url }) => [
        username,
        name,
        avatar_url,
      ]);
      const userQuery = format(
        `
          INSERT INTO users (username, name, avatar_url)
          VALUES %L
          RETURNING *
        `,
        formattedUser
      );
      return db.query(userQuery);
    });
  }

  function createArticles() {
    const query = `CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    topic VARCHAR(50) REFERENCES topics(slug),
    author VARCHAR(50) REFERENCES users(username),
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    votes INT DEFAULT 0,
    article_img_url VARCHAR(1000)
    );`;
    return db.query(query).then(() => {
      const formattedArticle = articleData.map(
        ({ title, topic, author, body }) => [title, topic, author, body]
      );
      const articleQuery = format(
        `
          INSERT INTO articles (title, topic, author, body)
          VALUES %L
          RETURNING *
        `,
        formattedArticle
      );
      return db.query(articleQuery);
    });
  }

  function createComments() {
    const query = `
      CREATE TABLE IF NOT EXISTS comments (
        comment_id SERIAL PRIMARY KEY,
        article_id INT REFERENCES articles(article_id),
        body TEXT,
        votes INT DEFAULT 0,
        author VARCHAR(50) REFERENCES users(username),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return db.query(query).then(() => {
      const convertedComments = commentData.map((comment) => {
        return convertTimestampToDate(comment);
      });
      const formattedComments = convertedComments.map(
        ({ article_id, body, votes, author, created_at }) => [
          article_id,
          body,
          votes,
          author,
          created_at,
        ]
      );

      const commentQuery = format(
        `
          INSERT INTO comments (article_id, body, votes, author, created_at)
          VALUES %L
          RETURNING *
        `,
        formattedComments
      );

      return db.query(commentQuery);
    });
  }
};
module.exports = seed;
