class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went worng!",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.stack = stack;
    this.data = null;
    this.success = false;
  }
}

export { ApiError };
