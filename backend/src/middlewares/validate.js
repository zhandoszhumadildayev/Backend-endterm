const { unprocessable } = require('../utils/httpError');

function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) {
      return next(unprocessable('Validation failed', result.error.flatten()));
    }
    req.validated = result.data;
    next();
  };
}

module.exports = validate;
