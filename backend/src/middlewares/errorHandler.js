const { HttpError } = require('../utils/httpError');

function notFoundHandler(req, _res, next) {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const response = {
    message: status === 500 ? 'Internal server error' : err.message
  };

  if (err.details) response.details = err.details;
  if (process.env.NODE_ENV !== 'production' && status === 500) response.debug = err.message;

  res.status(status).json(response);
}

module.exports = { notFoundHandler, errorHandler };
