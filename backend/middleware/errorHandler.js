const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { statusCode: 404, message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { statusCode: 400, message };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { statusCode: 400, message };
  }

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        error = {
          statusCode: 400,
          message: 'Resource already exists'
        };
        break;
      case '23503': // foreign_key_violation
        error = {
          statusCode: 400,
          message: 'Invalid reference to related resource'
        };
        break;
      case '23502': // not_null_violation
        error = {
          statusCode: 400,
          message: 'Required field is missing'
        };
        break;
      case '22001': // string_data_right_truncation
        error = {
          statusCode: 400,
          message: 'Data too long for field'
        };
        break;
      default:
        if (process.env.NODE_ENV === 'development') {
          error.message = err.message;
        }
    }
  }

  res.status(error.statusCode).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;