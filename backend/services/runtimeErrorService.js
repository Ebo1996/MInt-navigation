const MAX_ERRORS = 100;

const state = {
  items: []
};

const captureError = (error, req) => {
  const entry = {
    at: new Date().toISOString(),
    message: error?.message || "Unknown error",
    statusCode: Number(error?.statusCode || 500),
    method: req?.method || "",
    path: req?.originalUrl || ""
  };

  state.items.unshift(entry);
  if (state.items.length > MAX_ERRORS) {
    state.items = state.items.slice(0, MAX_ERRORS);
  }
};

const getRecentErrors = (limit = 10) => state.items.slice(0, Math.max(1, Number(limit) || 10));

module.exports = {
  captureError,
  getRecentErrors
};
