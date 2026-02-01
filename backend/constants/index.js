/**
 * Application-wide constants
 * Centralized configuration for status codes, messages, and magic numbers
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// Order Status
const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Invoice Status
const INVOICE_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

// Transaction Status
const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
};

// Domain Status
const DOMAIN_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

// User Roles
const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
};

// Error Messages
const ERROR_MESSAGES = {
  INTERNAL_SERVER: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  PRODUCT_NOT_FOUND: 'Product not found',
  CART_EMPTY: 'Cart is empty',
  INVALID_PAYMENT: 'Invalid payment details',
  DOMAIN_NOT_FOUND: 'Domain not found',
  CLIENT_NOT_FOUND: 'Client not found',
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  SIGNUP_SUCCESS: 'Signup successful',
  OTP_SENT: 'OTP sent successfully',
  CART_UPDATED: 'Cart updated successfully',
  ORDER_CREATED: 'Order created successfully',
  PAYMENT_SUCCESS: 'Payment successful',
  DOMAIN_REGISTERED: 'Domain registered successfully',
};

// Tax Configuration
const TAX_CONFIG = {
  GST_RATE: 0.18, // 18% GST
};

// Domain Configuration
const DOMAIN_CONFIG = {
  DEFAULT_PERIOD: 1, // 1 year
  MIN_PERIOD: 1,
  MAX_PERIOD: 10,
};

module.exports = {
  HTTP_STATUS,
  ORDER_STATUS,
  INVOICE_STATUS,
  TRANSACTION_STATUS,
  DOMAIN_STATUS,
  USER_ROLES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TAX_CONFIG,
  DOMAIN_CONFIG,
};
