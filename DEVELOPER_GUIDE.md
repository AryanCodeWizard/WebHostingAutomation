# WHMCS Domain Registration System

## 🏗️ Architecture Overview

Industry-standard e-commerce platform for domain registration with integrated payment processing and automated domain provisioning.

### Tech Stack
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React 18, Redux Toolkit, Tailwind CSS
- **Payment**: Razorpay Integration
- **Domain Registrar**: GoDaddy API

---

## 📁 Project Structure

```
backend/
├── config/           # Configuration files (DB, Razorpay, GoDaddy)
├── constants/        # App-wide constants and enums
├── controllers/      # Business logic handlers
├── middlewares/      # Auth and validation middleware
├── models/           # Mongoose schemas
├── routes/           # API route definitions
├── scripts/          # Database seed scripts
└── utils/            # Helper utilities (logger, response formatter)

frontend/
├── src/
│   ├── components/   # Reusable React components
│   ├── pages/        # Page-level components
│   ├── features/     # Redux slices
│   └── services/     # API service layer
```

---

## 🔄 Domain Purchase Flow

### Industry-Standard Payment-First Architecture

```
1. Browse Domains
   └─> Domain Checker (GoDaddy API)

2. Add to Cart
   └─> Shopping Cart (MongoDB)

3. Checkout
   └─> Billing Details Collection

4. Payment
   └─> Razorpay Payment Gateway
   └─> Signature Verification

5. Order Creation (Post-Payment)
   ├─> Create Invoice (status: paid)
   ├─> Create Order (status: pending)
   ├─> Link Transaction
   └─> Clear Cart

6. Domain Registration (Async Background)
   ├─> GoDaddy API Purchase
   ├─> Save Domain to DB
   └─> Update Order (status: completed)

7. Order Confirmation
   └─> Display Order & Invoice Details
```

**Key Design Decision**: Orders are created AFTER successful payment verification, following industry best practices (GoDaddy, Namecheap model).

---

## 🛠️ Key Features

### 1. Centralized Constants
**Location**: `backend/constants/index.js`

All status codes, error messages, and configuration values are centralized:
- HTTP status codes
- Order/Invoice/Transaction statuses
- Error and success messages
- Tax configuration
- Domain settings

### 2. Structured Logging
**Location**: `backend/utils/logger.js`

Color-coded logging system:
- `logger.info()` - Information (cyan)
- `logger.success()` - Success messages (green)
- `logger.warn()` - Warnings (yellow)
- `logger.error()` - Errors (red)
- `logger.debug()` - Debug info (magenta, dev only)

### 3. Standardized API Responses
**Location**: `backend/utils/response.js`

Consistent response structure across all endpoints:
```javascript
// Success
{
  success: true,
  message: "Operation successful",
  data: { ... }
}

// Error
{
  success: false,
  message: "Error description",
  error: "Detailed error (dev only)"
}
```

### 4. Async Domain Registration
Domain registration happens in the background using `setImmediate()`:
- Non-blocking: User gets immediate response
- Resilient: Payment succeeds even if domain registration fails
- Trackable: Order status updates after completion

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP for signup
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login

### Domains
- `GET /api/domains/check?domain=example.com` - Check availability
- `GET /api/domains` - List registered domains
- `GET /api/domains/:domain/dns` - Get DNS records
- `PUT /api/domains/:domain/dns/a-record` - Update A record

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update quantity
- `DELETE /api/cart/remove/:itemId` - Remove item
- `DELETE /api/cart/clear` - Clear cart

### Checkout & Payment
- `GET /api/checkout/review` - Get checkout summary
- `POST /api/checkout/billing` - Save billing details
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify-and-complete` - Verify payment & create order

### Client Profile
- `GET /api/clients/me` - Get current user profile
- `PUT /api/clients/me` - Update profile

---

## 🔐 Security Features

1. **JWT Authentication**: Token-based auth with middleware
2. **Password Hashing**: bcrypt for password security
3. **Payment Signature Verification**: Razorpay HMAC validation
4. **Input Validation**: Request body validation
5. **Error Sanitization**: Detailed errors only in development

---

## 🚀 Getting Started

### Prerequisites
```bash
- Node.js 16+
- MongoDB
- GoDaddy API Credentials (Test/Production)
- Razorpay API Keys (Test/Production)
```

### Installation
```bash
# Clone repository
git clone <repo-url>

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Variables
Create `backend/.env`:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/whmcs
JWT_SECRET=your_jwt_secret_key

RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

GODADDY_API_KEY=your_godaddy_key
GODADDY_API_SECRET=your_godaddy_secret
GODADDY_BASE_URL=https://api.ote-godaddy.com (test) / https://api.godaddy.com (production)
```

### Run Application
```bash
# From root directory
npm run dev

# Separately
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Access application at `http://localhost:5173`

---

## 📊 Database Models

### Core Models
- **User**: Authentication and user data
- **Client**: Extended user profile with business info
- **Product**: Domain registration product definition
- **Cart**: Shopping cart with auto-calculated totals
- **Order**: Purchase orders (created post-payment)
- **Invoice**: Payment invoices
- **Transaction**: Razorpay payment records
- **Domain**: Registered domains with GoDaddy

---

## 🧪 Testing

### Seed Domain Product
```bash
cd backend
node scripts/seed-domain-product.js
```

### Test Payment Flow
Use Razorpay test cards:
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

---

## 📝 Code Quality Standards

1. **JSDoc Comments**: All functions documented
2. **Consistent Naming**: camelCase for functions, PascalCase for models
3. **Error Handling**: Try-catch blocks with proper logging
4. **No Console.logs**: Use logger utility instead
5. **Constants Usage**: No magic numbers or hardcoded strings
6. **Response Standardization**: Use sendSuccess/sendError helpers

---

## 🔧 Development Guidelines

### Adding New Endpoint
```javascript
// 1. Define route in routes/
router.post('/new-endpoint', authenticate, controller.newFunction);

// 2. Implement controller
/**
 * Description of what this does
 * @route POST /api/resource/new-endpoint
 * @param {Type} req.body.param - Parameter description
 */
exports.newFunction = async (req, res) => {
  try {
    const { param } = req.body;
    
    // Validation
    if (!param) {
      return sendError(res, "Param required", HTTP_STATUS.BAD_REQUEST);
    }
    
    // Business logic
    logger.info(`Processing: ${param}`);
    const result = await Model.operation(param);
    
    // Success response
    return sendSuccess(res, result, "Operation successful");
  } catch (error) {
    logger.error("Operation failed", error);
    return sendError(res, "Error message", HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Cart showing empty**
   - Check JWT token validity
   - Verify userId in req.user.userId
   - Check cartSlice expects response.data.cart

2. **Payment verification fails**
   - Verify Razorpay signature
   - Check webhook endpoint (if using webhooks)
   - Ensure transaction exists with correct ref

3. **Domain registration 422 error**
   - Normal for test API with invalid domains
   - Check GoDaddy API credentials
   - Verify contact information format

---

## 📚 Additional Resources

- [Razorpay Docs](https://razorpay.com/docs/)
- [GoDaddy API Docs](https://developer.godaddy.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## 👥 Contributing

1. Follow existing code structure and naming conventions
2. Use logger utility instead of console.log
3. Add JSDoc comments to all functions
4. Test payment flow before committing
5. Update this README if adding major features

---

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated**: February 2026  
**Version**: 2.0.0 (Refactored Architecture)
