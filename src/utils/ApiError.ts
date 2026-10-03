export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors: string[];

  constructor(statusCode: number, message: string = 'Something went wrong', errors: string[] = [], stack: string = '') {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string = 'Bad request', errors: string[] = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = 'Unauthorized access', errors: string[] = []) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message: string = 'Forbidden action', errors: string[] = []) {
    return new ApiError(403, message, errors);
  }

  static notFound(message: string = 'Resource not found', errors: string[] = []) {
    return new ApiError(404, message, errors);
  }

  static conflict(message: string = 'Conflict detected', errors: string[] = []) {
    return new ApiError(409, message, errors);
  }

  static internal(message: string = 'Internal server error', errors: string[] = []) {
    return new ApiError(500, message, errors);
  }
}
