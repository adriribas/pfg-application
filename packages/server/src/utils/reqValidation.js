const validateFields = (Model, fields) => {
  if (!fields) {
    return true;
  }
  if (!fields instanceof Array) {
    return false;
  }
  const attributes = Object.keys(Model.getAttributes());
  return fields.every(field => attributes.includes(field));
};

export const validateReq = (req, Model, res) => {
  const query = req.query;

  if (!validateFields(Model, query.fields)) {
    res?.status(400).json({ code: 'ERR_BAD_FIELDS' });
    return false;
  }

  return true;
};

export const isDuplicationError = ({ errors, parent, original }) =>
  errors.some(({ type }) => type === 'unique violation') ||
  parent.code === 'ER_DUP_ENTRY' ||
  original.code === 'ER_DUP_ENTRY';
