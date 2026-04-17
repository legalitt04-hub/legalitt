const { AppError } = require('./errorHandler');

exports.validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const msg = error.details.map((d) => d.message).join('. ');
    return next(new AppError(msg, 400));
  }
  next();
};
