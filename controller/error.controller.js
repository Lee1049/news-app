exports.causeInternalServerError = (req, res, next) => {
  next(new Error("Error Message"));
};
