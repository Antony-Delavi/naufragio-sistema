const xss = require('xss');

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]); // recursivo
    }
  }

  return obj;
}

module.exports = function sanitize(req, res, next) {
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  next();
};
