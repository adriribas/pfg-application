export const formatFilter = (filterData = {}, associations = {}, specialOptions = {}) => ({
  data: filterData,
  associations,
  specialOptions
});

export const idAdapter = adapter => idField => {
  if (!idField) {
    return null;
  }

  if (idField instanceof Array) {
    return idField.map(adapter);
  }

  return adapter(idField);
};
