const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createReferenceObject = (array, key, value) => {
  const referenceObject = {};
  for (const element of array) {
    referenceObject[element[key]] = element[value];
  }
  return referenceObject;
};
