import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDatabase from './config/databse.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());


connectDatabase();

// Routes

// app.get('/api/health/detailed', async (req, res) => {
//   try {
//     // You can add database connection checks here later
//     const healthDetails = {
//       status: 'OK',
//       timestamp: new Date().toISOString(),
//       server: {
//         nodeVersion: process.version,
//         platform: process.platform,
//         uptime: process.uptime(),
//         memory: {
//           rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
//           heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
//           heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
//         }
//       },
//       services: {
//         database: 'Not implemented', // Will update when DB is connected
//         redis: 'Not implemented', // Will update when Redis is connected
//         queue: 'Not implemented' // Will update when BullMQ is set up
//       }
//     };

//     res.status(200).json(healthDetails);
//   } catch (error) {
//     res.status(500).json({
//       status: 'ERROR',
//       message: 'Health check failed',
//       error: error.message
//     });
//   }
// });


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

app.use('/api/auth', authRoutes);



// API welcome route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to WHMCS Alternative API',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
