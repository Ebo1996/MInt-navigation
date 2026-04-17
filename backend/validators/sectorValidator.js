const validateSectorPayload = (req) => {
  const { name } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("name is required");
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateSectorPayload
};
