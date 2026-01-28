const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const createError = require('http-errors');

// Initialize Express app
const app = express();

// =====================================
// 1. SECURITY MIDDLEWARE
// =====================================

// Set security HTTP headers
app.use(helmet());

// Enable CORS with specific options
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// =====================================
// 2. BODY PARSING MIDDLEWARE
// =====================================

// Parse JSON request bodies
app.use(express.json({
  limit: '10mb', // Prevent large payloads
  verify: (req, res, buf) => {
    // Store raw body for webhook signature verification (if needed later)
    req.rawBody = buf;
  }
}));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// =====================================
// 3. LOGGING & COMPRESSION
// =====================================

// HTTP request logger (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Compress response bodies
app.use(compression());

// =====================================
// 4. HEALTH CHECK ENDPOINT
// =====================================

// Simple health check route
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    version: process.version
  };

  res.status(200).json(healthCheck);
});

// More detailed health check (with system info)
app.get('/api/health/detailed', async (req, res) => {
  try {
    // You can add database connection checks here later
    const healthDetails = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: {
          rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
          heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
        }
      },
      services: {
        database: 'Not implemented', // Will update when DB is connected
        redis: 'Not implemented', // Will update when Redis is connected
        queue: 'Not implemented' // Will update when BullMQ is set up
      }
    };

    res.status(200).json(healthDetails);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// =====================================
// 5. API ROUTES (PLACEHOLDER)
// =====================================

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'WHMCS Alternative API',
    version: '1.0.0',
    documentation: '/api/docs', // Will add Swagger later
    endpoints: {
      auth: '/api/auth',
      clients: '/api/clients',
      products: '/api/products',
      orders: '/api/orders',
      invoices: '/api/invoices'
    }
  });
});

// API welcome route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to WHMCS Alternative API',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// =====================================
// 6. ERROR HANDLING MIDDLEWARE
// =====================================

// 404 handler for undefined routes
app.use((req, res, next) => {
  next(createError.NotFound(`Route ${req.method} ${req.url} not found`));
});

// Global error handler
app.use((error, req, res, next) => {
  // Log error (in production, use a proper logging service)
  console.error('Error:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Set default status code
  const statusCode = error.status || 500;
  
  // Prepare error response
  const errorResponse = {
    error: {
      message: error.message || 'Internal Server Error',
      status: statusCode,
      timestamp: new Date().toISOString(),
      path: req.path
    }
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
});

// =====================================
// 7. SERVER GRACEFUL SHUTDOWN HANDLER
// =====================================

// This will be used by server.js for graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (app.server) {
    app.server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  if (app.server) {
    app.server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  }
});

module.exports = app;