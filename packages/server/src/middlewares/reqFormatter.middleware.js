export const requestFormatter = (req, res, next) => {
  const query = req.query;

  if (query.fields) {
    query.fields = query.fields.split(',');
  }

  next();
};
