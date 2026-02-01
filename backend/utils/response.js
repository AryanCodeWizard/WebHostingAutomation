/**
 * Standard API response formatter
 * Ensures consistent response structure across all endpoints
 */

const { HTTP_STATUS } = require('../constants');

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {Object} error - Error details (only in development)
 */
const sendError = (res, message = 'Error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, error = null) => {
  const response = {
    success: false,
    message,
  };

  // Include error details only in development
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error.message || error;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors array
 */
const sendValidationError = (res, errors) => {
  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    message: 'Validation failed',
    errors,
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
};
