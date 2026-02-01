/**
 * Centralized logging utility
 * Provides consistent logging across the application
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Format timestamp for logs
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Log info message
 */
const info = (message, data = null) => {
  console.log(
    `${colors.cyan}[INFO]${colors.reset} ${getTimestamp()} - ${message}`,
    data ? data : ''
  );
};

/**
 * Log success message
 */
const success = (message, data = null) => {
  console.log(
    `${colors.green}[SUCCESS]${colors.reset} ${getTimestamp()} - ${message}`,
    data ? data : ''
  );
};

/**
 * Log warning message
 */
const warn = (message, data = null) => {
  console.warn(
    `${colors.yellow}[WARN]${colors.reset} ${getTimestamp()} - ${message}`,
    data ? data : ''
  );
};

/**
 * Log error message
 */
const error = (message, err = null) => {
  console.error(
    `${colors.red}[ERROR]${colors.reset} ${getTimestamp()} - ${message}`,
    err ? err.message || err : ''
  );
  if (err && err.stack && process.env.NODE_ENV === 'development') {
    console.error(colors.red + err.stack + colors.reset);
  }
};

/**
 * Log debug message (only in development)
 */
const debug = (message, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `${colors.magenta}[DEBUG]${colors.reset} ${getTimestamp()} - ${message}`,
      data ? data : ''
    );
  }
};

module.exports = {
  info,
  success,
  warn,
  error,
  debug,
};
