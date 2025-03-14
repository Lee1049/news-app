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

  test("404: responds with an error if article_id does not exist", () => {
    return request(app)
      .get(`/api/articles/999999`)
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
//7
describe("PATCH /api/articles/:article_id", () => {
  test("200: responds by updating the votes of the article when votes INCREASE", () => {
    const updatedVotes = { inc_votes: 5 };

    return request(app)
      .patch("/api/articles/1")
      .send(updatedVotes)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toHaveProperty("votes");
        expect(article.votes).toBe(105);
      });
  });

  test("200: responds by updating the votes of the article when votes DECREASE", () => {
    const updatedVotes = { inc_votes: -5 };

    return request(app)
      .patch("/api/articles/1")
      .send(updatedVotes)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toHaveProperty("votes");
        expect(article.votes).toBe(95);
      });
  });

  test("400: responds with an error if inc_votes is not a number", () => {
    const invalidVotes = { inc_votes: "giving_vote" };

    return request(app)
      .patch("/api/articles/1")
      .send(invalidVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid: votes must be a number");
      });
  });

  test("400: responds with an error if request body doesn't have inc_votes property", () => {
    const missingVotes = {};

    return request(app)
      .patch("/api/articles/1")
      .send(missingVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid: votes must be a number");
      });
  });

  test("400: responds with an error if article_id is not valid", () => {
    const updatedVotes = { inc_votes: 5 };

    return request(app)
      .patch("/api/articles/abc")
      .send(updatedVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid comment ID");
      });
  });

  test("404: responds with an error if the article does not exist", () => {
    const updatedVotes = { inc_votes: 1 };

    return request(app)
      .patch("/api/articles/9999")
      .send(updatedVotes)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});
//8
describe("DELETE /api/comments/:comment_id", () => {
  test("204: responds by deleting the comment, returning no content", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(() => {
        return db.query("SELECT * FROM comments WHERE comment_id = 1;");
      })
      .then(({ rows }) => {
        expect(rows.length).toBe(0);
      });
  });

  test("400: responds with error if the comment is invalid", () => {
    return request(app)
      .delete("/api/comments/notAnId")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid comment ID");
      });
  });

  test("404: responds with an error if the comment does not exist", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment not found");
      });
  });
});
//9
describe("GET /api/users", () => {
  test("200: responds with an array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
        users.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
        });
      });
  });

  test("200: responds with an empty array if no users exist", () => {
    return db.query("DELETE FROM users;").then(() => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users).toEqual([]);
        });
    });
  });
});
// 10
describe("GET /api/articles (sorting queries)", () => {
  test("200: responds with an empty array if no articles exist", () => {
    return db.query("DELETE FROM articles").then(() => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toEqual([]);
        });
    });
  });

  test("200: responds with articles sorted by created_at DESC when no sort_by or order is given", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("200: responds with articles sorted by title ASC when sort_by=title and order=asc is given", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("title", { ascending: true });
      });
  });

  test("200: responds with articles sorted by votes DESC when sort_by=votes and order=desc is given", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=desc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("votes", { descending: true });
      });
  });

  test("400: responds with an error if sort_by is an invalid column", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid_column&order=asc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid sort column");
      });
  });

  test('400: responds with an error if the order is not "asc" OR "desc"', () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=invalid_order")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid order value");
      });
  });
});
//11
describe("GET /api/articles (topic query)", () => {
  test("200: responds with articles filtered by a valid topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach((article) => {
          expect(article).toHaveProperty("topic", "cats");
        });
      });
  });

  test("200: responds with all articles when no topic is provided", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);
      });
  });

  test("200: responds with an empty array if no articles exist for the given topic", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toEqual([]);
      });
  });

  test("404: responds with an error if the topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=nonexistent_topic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic not found");
      });
  });
});
//12
describe("GET /api/articles/:article_id (comment_count)", () => {
  test("200: responds with the article and includes a comment_count", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("article_id", 1);
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
        expect(article).toHaveProperty("article_img_url");
        expect(article).toHaveProperty("comment_count");
        expect(typeof article.comment_count).toBe("string");
        expect(Number(article.comment_count)).toBeGreaterThanOrEqual(0);
      });
  });

  test("200: responds with 0 comment_count if there are no comments for the article", () => {
    return request(app)
      .get("/api/articles/4")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("article_id", 4);
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
        expect(article).toHaveProperty("article_img_url");
        expect(article).toHaveProperty("comment_count", "0");
      });
  });

  test("404: responds with an error if the article does not exist", () => {
    return request(app)
      .get("/api/articles/999999") // Using a non-existing article ID
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Unable to find the article");
      });
  });
});
//13
describe("GET /api/users/:username", () => {
  test("200: responds with a user object when the username exists", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toHaveProperty("username", "butter_bridge");
        expect(user).toHaveProperty(
          "avatar_url",
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
        );
        expect(user).toHaveProperty("name", "jonny");
      });
  });

  test("404: responds with an error when the user does not exist", () => {
    return request(app)
      .get("/api/users/non_existent_user")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User not found");
      });
  });
});
//14
describe("PATCH /api/comments/:comment_id", () => {
  test("200: responds by updating the votes of a comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toHaveProperty("votes");
        expect(comment.votes).toBeGreaterThan(0);
      });
  });

  test("400: responds with an error when an invalid vote increment is provided", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "invalid" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid: votes must be a number");
      });
  });

  test("404: responds with an error when comment_id does not exist", () => {
    return request(app)
      .patch("/api/comments/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment not found");
      });
  });
});
//Err
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
