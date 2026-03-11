function success(data, message = "OK", meta = undefined) {
  const response = {
    success: true,
    message,
    data
  };

  if (meta !== undefined) {
    response.meta = meta;
  }

  return response;
}

function error(message, code = "INTERNAL_ERROR", details = undefined) {
  const response = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (details !== undefined) {
    response.error.details = details;
  }

  return response;
}

module.exports = { success, error };
