const {
  fetchAllTopics,
  fetchOneArticle,
  fetchAllArticles,
  fetchArticleComments,
  postCommentForArticle,
  updateVotesByArticleId,
  removeCommentById,
  fetchAllUsers,
} = require("../model/news.model");

const endpointsJson = require("../endpoints.json");

exports.getApiEndpoints = (req, res, next) => {
  res.status(200).send({ endpoints: endpointsJson });
};

exports.getAllTopics = (req, res, next) => {
  fetchAllTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getOneArticle = (req, res, next) => {
  const { article_id } = req.params;

  fetchOneArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllArticles = (req, res, next) => {
  const { sort_by, order } = req.query;

  fetchAllArticles({ sort_by, order })
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleComments(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.createCommentForArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { author, body } = req.body;

  postCommentForArticle(article_id, author, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.updateArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateVotesByArticleId(article_id, inc_votes)
    .then((updatedArticle) => {
      res.status(200).send({ article: updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  removeCommentById(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllUsers = (req, res, next) => {
  fetchAllUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};
