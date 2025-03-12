const endpointsJson = require("../endpoints.json");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const app = require("../app");
const request = require("supertest");
const { toBeSortedBy } = require("jest-sorted");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});
//1
describe("GET /api", () => {
  test("200: responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});
//2
describe("GET /api/topics", () => {
  test("200: responds with an array of topic objects with slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).toBeGreaterThan(0);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});
//3
describe("GET /api/articles/:article_id", () => {
  test("200: responds with a single article", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toHaveProperty("article_id", 1);
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
        expect(article).toHaveProperty("article_img_url");
      });
  });

  test("400: responds with an error if there is an invalid article_id", () => {
    return request(app)
      .get("/api/articles/notAnId")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid article ID");
      });
  });

  test("404: responds with an error if there is no article ", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Unable to find the article");
      });
  });
});
//4
describe("GET /api/articles", () => {
  test("200: responds with an array of articles sorted by date descending", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);

        articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
          expect(article).not.toHaveProperty("body");
        });
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("404: responds with an error if no articles exist", () => {
    return db
      .query("DELETE FROM articles RETURNING *;") // Clears articles table
      .then(() => {
        return request(app)
          .get("/api/articles")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("No articles found");
          });
      });
  });
});
//5
describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBeGreaterThan(0);

        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("article_id");
          expect(comment).toHaveProperty("body");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("created_at");
        });
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("200: responds with an empty array when article has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBe(0);
      });
  });

  test("400: responds with an error if article_id is invalid", () => {
    return request(app)
      .get("/api/articles/notAnId/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid article ID");
      });
  });

  test("404: responds with an error if article_id does not exist", () => {
    return request(app)
      .get("/api/articles/99999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Unable to find the article");
      });
  });
});
//6
describe("POST /api/articles/:article_id/comments", () => {
  test("201: responds with the new posted comment", () => {
    const newComment = {
      author: "butter_bridge",
      body: "This is a test comment!",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toHaveProperty("comment_id");
        expect(comment).toHaveProperty("article_id", 1);
        expect(comment).toHaveProperty("body", "This is a test comment!");
        expect(comment).toHaveProperty("author", "butter_bridge");
        expect(comment).toHaveProperty("votes", 0);
        expect(comment).toHaveProperty("created_at");
      });
  });

  test("400: responds with an error if the author or body is missing", () => {
    const invalidComment1 = { body: "This is missing an author" };
    const invalidComment2 = { author: "mike_smith" };

    return request(app)
      .post("/api/articles/1/comments")
      .send(invalidComment1)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing the required author or body");
      })
      .then(() => {
        return request(app)
          .post("/api/articles/1/comments")
          .send(invalidComment2)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Missing the required author or body");
          });
      });
  });

  test("404: responds with an error if the article_id does not exist", () => {
    const newComment = {
      author: "mike_smith",
      body: "This is a comment for a non-existing article!",
    };
    return request(app)
      .post("/api/articles/99999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User not found");
      });
  });

  test("400: responds with an error if the article_id is not a number", () => {
    const newComment = {
      author: "butter_bridge",
      body: "This is a comment!",
    };

    return request(app)
      .post("/api/articles/abc/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid article ID");
      });
  });
});

describe("Error handling", () => {
  test("500: responds with an internal server error ", () => {
    return request(app)
      .get("/api/trigger-500-error")
      .expect(500)
      .then(({ body }) => {
        expect(body.msg).toBe("Internal Server Error");
      });
  });
});
