# 🎮 Controllers Documentation

This document provides a comprehensive overview of all controllers in the WHMCS backend system, their purpose, routes, and usage.

---

## 📋 Table of Contents

1. [AuthController](#1-authcontroller)
2. [CartController](#2-cartcontroller)
3. [CheckoutController](#3-checkoutcontroller)
4. [ClientController](#4-clientcontroller)
5. [DomainController](#5-domaincontroller)
6. [PaymentController](#6-paymentcontroller)
7. [ProductController](#7-productcontroller)
8. [WebhookController](#8-webhookcontroller)
9. [DomainPurchaseService](#9-domainpurchaseservice)

---

## 1. AuthController

**File:** `backend/controllers/AuthController.js`

### Purpose
Handles user authentication, registration, and account management.

### Functions

#### `sendOtp(req, res)`
- **Route:** `POST /api/auth/send-otp`
- **Auth Required:** No
- **Description:** Sends OTP to email for signup verification
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "data": {
      "email": "user@example.com"
    }
  }
  ```

#### `signup(req, res)`
- **Route:** `POST /api/auth/signup`
- **Auth Required:** No
- **Description:** Registers new user after OTP verification, auto-creates Client profile for 'client' role
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "SecurePass123",
    "role": "client",
    "otp": "123456"
  }
  ```
- **Side Effects:**
  - Creates User record
  - Auto-creates Client profile if role = 'client'
  - Generates JWT token
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {...},
      "token": "eyJhbGc..."
    }
  }
  ```

#### `login(req, res)`
- **Route:** `POST /api/auth/login`
- **Auth Required:** No
- **Description:** Authenticates user and returns JWT token
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {...},
      "token": "eyJhbGc..."
    }
  }
  ```

#### `changePassword(req, res)`
- **Route:** `POST /api/auth/change-password`
- **Auth Required:** Yes (JWT)
- **Description:** Changes user password
- **Request Body:**
  ```json
  {
    "oldPassword": "OldPass123",
    "newPassword": "NewPass456"
  }
  ```

#### `resetPassword(req, res)`
- **Route:** `POST /api/auth/reset-password`
- **Auth Required:** No
- **Description:** Resets password via email token
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "token": "reset-token",
    "newPassword": "NewPass789"
  }
  ```

### Used By
- Frontend: Login page, Signup page
- Routes: `backend/routes/authRoutes.js`

### Dependencies
- Models: User, Client, OTP
- Utils: JWT, bcrypt, otp-generator
- Services: Email service (for OTP)

---

## 2. CartController

**File:** `backend/controllers/cartController.js`

### Purpose
Manages shopping cart operations for products (domains, hosting, etc.)

### Functions

#### `addToCart(req, res)`
- **Route:** `POST /api/cart/add`
- **Auth Required:** Yes
- **Description:** Adds product to user's cart with configuration
- **Request Body:**
  ```json
  {
    "productId": "697e5e71d8f29f3bd1f5ce66",
    "quantity": 1,
    "config": {
      "domain": "example.com",
      "period": 1
    }
  }
  ```
- **Validation:**
  - Product must exist in database
  - For domain products: `config.domain` and `config.period` required
- **Response:**
  ```json
  {
    "success": true,
    "message": "Item added to cart successfully",
    "data": {
      "cart": {...}
    }
  }
  ```

#### `getCart(req, res)`
- **Route:** `GET /api/cart`
- **Auth Required:** Yes
- **Description:** Retrieves current user's cart with populated product details
- **Response:**
  ```json
  {
    "success": true,
    "message": "Cart retrieved successfully",
    "data": {
      "cart": {
        "items": [...],
        "subtotal": 887,
        "tax": 159.66,
        "total": 1046.66
      }
    }
  }
  ```

#### `updateCartItem(req, res)`
- **Route:** `PUT /api/cart/update/:id`
- **Auth Required:** Yes
- **Description:** Updates quantity of cart item
- **Request Body:**
  ```json
  {
    "quantity": 2
  }
  ```

#### `removeFromCart(req, res)`
- **Route:** `DELETE /api/cart/remove/:id`
- **Auth Required:** Yes
- **Description:** Removes specific item from cart

#### `clearCart(req, res)`
- **Route:** `DELETE /api/cart/clear`
- **Auth Required:** Yes
- **Description:** Clears entire cart

### Used By
- Frontend: Cart page, Domain checker
- Routes: `backend/routes/cartRoutes.js`
- Flow: Pre-checkout step

### Dependencies
- Models: Cart, Product
- Middleware: auth

### Notes
- Cart auto-calculates subtotal, tax (18% GST), and total
- Uses Mongoose pre-save hooks for calculations
- Populates product details on fetch

---

## 3. CheckoutController

**File:** `backend/controllers/checkoutController.js`

### Purpose
Converts cart items into Order and Invoice before payment (removed in refactored flow)

### Status
⚠️ **DEPRECATED** - This controller was part of the old flow where orders were created BEFORE payment. In the new industry-standard flow, orders are created AFTER payment verification.

### Original Function

#### `createCheckout(req, res)` [DEPRECATED]
- **Route:** `POST /api/checkout`
- **Auth Required:** Yes
- **Description:** Created Order + Invoice from cart (old flow)
- **New Flow:** Orders now created in `paymentController.verifyAndCompleteOrder()`

### Migration Notes
The checkout flow now works as:
1. User adds to cart
2. User proceeds to payment directly (no pre-order creation)
3. Payment successful → Order + Invoice created
4. Domain registration triggered

---

## 4. ClientController

**File:** `backend/controllers/ClientController.js`

### Purpose
Manages client profiles (billing information) linked to User accounts

### Functions

#### `getMyProfile(req, res)`
- **Route:** `GET /api/clients/me`
- **Auth Required:** Yes
- **Description:** Gets current user's client profile, auto-creates if missing
- **Response:**
  ```json
  {
    "success": true,
    "message": "Client profile retrieved successfully",
    "data": {
      "userId": {...},
      "company": "Acme Inc",
      "address": "123 Main St",
      "gst": "GST123456",
      "walletBalance": 1000
    }
  }
  ```

#### `updateMyProfile(req, res)`
- **Route:** `PUT /api/clients/me`
- **Auth Required:** Yes
- **Description:** Updates client's business information
- **Request Body:**
  ```json
  {
    "company": "New Company Name",
    "address": "456 Business Ave",
    "gst": "GST789012"
  }
  ```
- **Note:** `walletBalance` cannot be updated by user (admin/payment only)

#### `getAllClients(req, res)`
- **Route:** `GET /api/clients`
- **Auth Required:** Yes (Admin only)
- **Description:** Gets all client profiles with user details
- **Response:**
  ```json
  {
    "success": true,
    "message": "Clients retrieved successfully",
    "data": [...]
  }
  ```

#### `getClientById(req, res)`
- **Route:** `GET /api/clients/:id`
- **Auth Required:** Yes (Admin only)
- **Description:** Gets specific client by ID

### Used By
- Frontend: Profile page (Business Information section)
- Payment flow: WHOIS contact details for domain registration
- Routes: `backend/routes/clientRoutes.js`

### Dependencies
- Models: Client, User
- Middleware: auth, isAdmin (for admin routes)

### Notes
- Client profile auto-created during signup for 'client' role users
- Used for invoice billing details
- Used for domain WHOIS contact information
- Wallet balance managed by payment system

---

## 5. DomainController

**File:** `backend/controllers/domainController.js`

### Purpose
Integrates with GoDaddy API for domain operations

### Functions

#### `checkDomain(req, res)`
- **Route:** `GET /api/domains/check?domain=example.com`
- **Auth Required:** No
- **Description:** Checks domain availability via GoDaddy API
- **Query Params:**
  ```
  domain: example.com
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Domain availability checked",
    "data": {
      "available": true,
      "domain": "example.com",
      "price": 10690000,
      "currency": "USD",
      "period": 1
    }
  }
  ```

#### `getDomains(req, res)`
- **Route:** `GET /api/domains`
- **Auth Required:** Yes
- **Description:** Gets all domains owned by current user from database
- **Response:**
  ```json
  {
    "success": true,
    "message": "Domains retrieved successfully",
    "data": [
      {
        "name": "example.com",
        "registrar": "godaddy",
        "status": "active",
        "expiryDate": "2026-01-15T00:00:00.000Z"
      }
    ]
  }
  ```

#### `getDNSRecords(req, res)`
- **Route:** `GET /api/domains/:domain/dns`
- **Auth Required:** Yes
- **Description:** Gets DNS records for a domain from GoDaddy
- **Response:**
  ```json
  {
    "success": true,
    "message": "DNS records retrieved",
    "data": [
      {
        "type": "A",
        "name": "@",
        "data": "192.168.1.1",
        "ttl": 3600
      }
    ]
  }
  ```

#### `updateARecord(req, res)`
- **Route:** `PUT /api/domains/:domain/a-record`
- **Auth Required:** Yes
- **Description:** Updates A record for a domain
- **Request Body:**
  ```json
  {
    "ip": "192.168.1.100"
  }
  ```

### Used By
- Frontend: Domain checker, Domain list, DNS manager
- Routes: `backend/routes/goDaddyRoutes.js`
- Payment flow: Domain registration after successful payment

### Dependencies
- Config: `backend/config/godaddy.js` (Axios instance)
- Models: Domain
- External API: GoDaddy API

### Notes
- Uses GoDaddy Sandbox/Production credentials from `.env`
- Domain ownership verified against database before DNS operations
- Implements proper error handling for API failures

---

## 6. PaymentController

**File:** `backend/controllers/paymentController.js`

### Purpose
Handles Razorpay payment integration and order completion after payment

### Functions

#### `createRazorpayOrder(req, res)`
- **Route:** `POST /api/payments/create-razorpay-order`
- **Auth Required:** Yes
- **Description:** Creates Razorpay order for cart items
- **Request Body:**
  ```json
  {
    "items": [
      {
        "productId": "...",
        "name": "Domain Registration - example.com",
        "price": 887,
        "quantity": 1,
        "config": {
          "domain": "example.com",
          "period": 1
        }
      }
    ],
    "billingDetails": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "address": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India"
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Razorpay order created successfully",
    "data": {
      "id": "order_xxx",
      "amount": 104666,
      "currency": "INR",
      "key": "rzp_test_xxx"
    }
  }
  ```
- **Side Effects:**
  - Creates Transaction record (status: pending)
  - Stores cart items and billing details temporarily

#### `verifyAndCompleteOrder(req, res)`
- **Route:** `POST /api/payments/verify-and-complete`
- **Auth Required:** Yes (via Razorpay response)
- **Description:** Verifies payment signature and completes order (Industry Standard Flow)
- **Request Body:**
  ```json
  {
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx",
    "items": [...],
    "billingDetails": {...}
  }
  ```
- **Process Flow:**
  1. ✅ Verify Razorpay signature
  2. ✅ Update Transaction → "success"
  3. ✅ Create Client profile if missing
  4. ✅ Create Invoice (status: "paid")
  5. ✅ Create Order (status: "pending")
  6. ✅ Clear user's cart
  7. ✅ Trigger domain registration (async, non-blocking)
  8. ✅ Return success response
- **Response:**
  ```json
  {
    "success": true,
    "message": "Payment verified and order completed",
    "data": {
      "order": {...},
      "invoice": {...},
      "transaction": {...}
    }
  }
  ```

#### Helper Functions

##### `registerDomainAfterPayment(order, client, user)`
- **Internal Function**
- **Description:** Registers domain with GoDaddy asynchronously after payment
- **Process:**
  1. Extracts domain from order items config
  2. Prepares WHOIS contact details from Client + User data
  3. Calls GoDaddy purchase API
  4. Saves Domain record to database on success
- **Error Handling:** Logs errors but doesn't fail payment (background job)

##### `prepareContactInfo(client, user, billingDetails)`
- **Internal Function**
- **Description:** Prepares WHOIS contact information for domain registration
- **Returns:** Contact object with admin, registrant, tech, and billing details

### Used By
- Frontend: Payment page, Checkout flow
- Routes: `backend/routes/paymentRoutes.js`
- Webhook: Alternative payment confirmation path

### Dependencies
- Models: Transaction, Invoice, Order, Client, Cart, Domain
- External: Razorpay SDK, GoDaddy API
- Config: Razorpay credentials from `.env`

### Notes
- **Industry Standard:** Order created AFTER payment (not before)
- **Async Domain Registration:** Doesn't block payment response
- **Idempotent:** Safe to call multiple times with same payment
- **Error Resilient:** Domain registration failure doesn't affect payment success

---

## 7. ProductController

**File:** `backend/controllers/ProductController.js`

### Purpose
Manages product catalog (domains, hosting, VPS, SaaS offerings)

### Functions

#### `getAllProducts(req, res)`
- **Route:** `GET /api/products`
- **Auth Required:** No
- **Description:** Gets all products from catalog
- **Response:**
  ```json
  {
    "success": true,
    "message": "Products retrieved successfully",
    "data": [
      {
        "_id": "...",
        "name": "Domain Registration",
        "type": "domain",
        "price": 887,
        "description": "Register your domain",
        "billingCycle": "yearly"
      }
    ]
  }
  ```

#### `getProductById(req, res)`
- **Route:** `GET /api/products/:id`
- **Auth Required:** No
- **Description:** Gets single product details
- **Response:**
  ```json
  {
    "success": true,
    "message": "Product retrieved successfully",
    "data": {...}
  }
  ```

#### `createProduct(req, res)`
- **Route:** `POST /api/products`
- **Auth Required:** Yes (Admin only)
- **Description:** Creates new product in catalog
- **Request Body:**
  ```json
  {
    "name": "Premium Hosting",
    "type": "hosting",
    "price": 1999,
    "description": "Premium hosting plan",
    "billingCycle": "monthly",
    "setupFee": 500
  }
  ```

#### `updateProduct(req, res)`
- **Route:** `PUT /api/products/:id`
- **Auth Required:** Yes (Admin only)
- **Description:** Updates existing product

#### `deleteProduct(req, res)`
- **Route:** `DELETE /api/products/:id`
- **Auth Required:** Yes (Admin only)
- **Description:** Deletes product from catalog

### Used By
- Frontend: Product page, Domain checker
- Routes: `backend/routes/productRoute.js`
- Cart: Product details populated in cart items

### Dependencies
- Models: Product
- Middleware: auth, isAdmin

### Notes
- Product types: `domain`, `hosting`, `vps`, `saas`
- Billing cycles: `monthly`, `quarterly`, `yearly`
- Products can have setup fees
- Used as reference for cart items and orders

---

## 8. WebhookController

**File:** `backend/controllers/webhookController.js`

### Purpose
Handles Razorpay webhook events for automated payment processing

### Functions

#### `razorpayWebhook(req, res)`
- **Route:** `POST /api/webhooks/razorpay`
- **Auth Required:** No (Webhook signature verified)
- **Description:** Processes Razorpay webhook events (alternative to direct payment verification)
- **Webhook Events Handled:**
  - `payment.captured` - Payment successful
  - `payment.failed` - Payment failed
- **Process Flow (payment.captured):**
  1. ✅ Verify webhook signature
  2. ✅ Find Transaction by Razorpay order ID
  3. ✅ Update Transaction → "success"
  4. ✅ Update Invoice → "paid"
  5. ✅ Update Order → "completed"
  6. ✅ Extract domain from order items
  7. ✅ Call GoDaddy API to register domain
  8. ✅ Save Domain to database
  9. ✅ Respond 200 OK to Razorpay
- **Security:**
  - Signature verification using `RAZORPAY_WEBHOOK_SECRET`
  - Temporary bypass in development (logs warning)
- **Response:**
  ```json
  {
    "status": "ok"
  }
  ```

### Used By
- External: Razorpay server (webhook callback)
- Routes: `backend/routes/webhookRoutes.js`
- Alternative to: Frontend payment verification

### Dependencies
- Models: Transaction, Invoice, Order, Domain
- External: Razorpay webhook, GoDaddy API
- Config: Webhook secret from `.env`

### Notes
- **Idempotent:** Safe to process same webhook multiple times
- **Async Domain Registration:** Doesn't block webhook response
- **Error Handling:** Domain registration errors logged but don't fail webhook
- **Production:** Signature verification must be enabled
- **Fallback:** Used when frontend verification fails

---

## 9. DomainPurchaseService

**File:** `backend/services/DomainPurchaseService.js`

### Purpose
Service layer for complete domain purchase flow (testing/development)

### Functions

#### `completeDomainPurchase(userId, domainName, period)`
- **Route:** `POST /api/domain-purchase/complete`
- **Auth Required:** Yes
- **Description:** Executes complete domain purchase flow in one API call (for testing)
- **Request Body:**
  ```json
  {
    "domainName": "test.com",
    "period": 1
  }
  ```
- **Process Flow:**
  1. Find/create Client profile
  2. Create domain product in cart
  3. Create Order + Invoice
  4. Create Transaction (pending)
  5. Simulate payment success
  6. Register domain with GoDaddy
  7. Save Domain to database
- **Response:**
  ```json
  {
    "success": true,
    "message": "Domain purchase completed",
    "data": {
      "order": {...},
      "invoice": {...},
      "domain": {...}
    }
  }
  ```

#### `addDomainToCart(userId, domainName, priceINR, period)`
- **Route:** `POST /api/domain-purchase/add-to-cart`
- **Auth Required:** Yes
- **Description:** Helper to add domain to cart with validation
- **Request Body:**
  ```json
  {
    "domainName": "test.com",
    "priceINR": 887,
    "period": 1
  }
  ```

#### `getUserSummary(userId)`
- **Route:** `GET /api/domain-purchase/summary`
- **Auth Required:** Yes
- **Description:** Gets user's complete summary (orders, invoices, domains, cart)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "orders": [...],
      "invoices": [...],
      "domains": [...],
      "cart": {...}
    }
  }
  ```

### Used By
- Routes: `backend/routes/domainPurchaseRoutes.js`
- Testing: End-to-end flow testing
- Development: Quick domain purchase without frontend

### Dependencies
- All models: Cart, Order, Invoice, Transaction, Domain, Client, Product
- External: GoDaddy API

### Notes
- ⚠️ **Testing/Development Only** - Not used in production flow
- Useful for backend testing and debugging
- Bypasses normal cart → checkout → payment flow
- Good reference for understanding complete domain purchase logic

---

## 🔄 Controller Interaction Flow

### Domain Purchase Flow (Production)

```
1. Domain Checker (Frontend)
   ↓
2. DomainController.checkDomain() → GoDaddy API
   ↓
3. CartController.addToCart() → Save to Cart
   ↓
4. CartController.getCart() → View Cart
   ↓
5. PaymentController.createRazorpayOrder() → Create Payment
   ↓
6. Razorpay Payment UI (Frontend)
   ↓
7. PaymentController.verifyAndCompleteOrder()
   ├─→ Create Invoice
   ├─→ Create Order
   ├─→ Update Transaction
   ├─→ Clear Cart
   └─→ Async: registerDomainAfterPayment()
       ├─→ ClientController data (WHOIS)
       ├─→ DomainController (GoDaddy API)
       └─→ Save Domain to DB
   ↓
8. Frontend: Order Confirmation Page
```

### Alternative Flow (Webhook)

```
1-6. Same as above
   ↓
7. WebhookController.razorpayWebhook()
   ├─→ Update Transaction
   ├─→ Update Invoice
   ├─→ Update Order
   └─→ Register Domain + Save to DB
```

---

## 📊 Controller Usage Matrix

| Controller | Public Routes | Auth Routes | Admin Routes | External APIs |
|-----------|---------------|-------------|--------------|---------------|
| AuthController | ✅ (login, signup, OTP) | ✅ (change password) | ❌ | ❌ |
| CartController | ❌ | ✅ (all routes) | ❌ | ❌ |
| CheckoutController | ❌ | ⚠️ (deprecated) | ❌ | ❌ |
| ClientController | ❌ | ✅ (profile) | ✅ (all clients) | ❌ |
| DomainController | ✅ (check) | ✅ (list, DNS) | ❌ | ✅ (GoDaddy) |
| PaymentController | ❌ | ✅ (all routes) | ❌ | ✅ (Razorpay) |
| ProductController | ✅ (read) | ❌ | ✅ (CUD) | ❌ |
| WebhookController | ⚠️ (signature auth) | ❌ | ❌ | ✅ (Razorpay) |
| DomainPurchaseService | ❌ | ✅ (testing) | ❌ | ✅ (GoDaddy) |

---

## 🔐 Authentication Requirements

### No Auth Required
- `POST /api/auth/send-otp`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/domains/check`

### User Auth Required (JWT)
- All Cart routes
- All Payment routes
- `GET /api/clients/me`
- `PUT /api/clients/me`
- `GET /api/domains` (owned domains)
- `GET/PUT /api/domains/:domain/*` (owned domains)

### Admin Auth Required
- `POST/PUT/DELETE /api/products/*`
- `GET /api/clients` (all clients)
- `GET /api/clients/:id`

### Webhook Auth (Signature)
- `POST /api/webhooks/razorpay`

---

## 📝 Notes for Developers

### Best Practices Followed

1. **Consistent Response Structure**
   ```json
   {
     "success": true/false,
     "message": "Human readable message",
     "data": {...} // Optional
   }
   ```

2. **Error Handling**
   - All controllers use try-catch blocks
   - Standardized error responses with HTTP status codes
   - Detailed error logging for debugging

3. **Validation**
   - Input validation before processing
   - MongoDB ObjectId validation
   - Business logic validation (e.g., domain config required)

4. **Security**
   - JWT authentication middleware
   - Role-based access control (RBAC)
   - Webhook signature verification
   - Password hashing (bcrypt)

5. **Async Operations**
   - Domain registration doesn't block payment response
   - Background processing for long-running tasks
   - Proper error handling in async functions

### Common Patterns

#### Controller Structure
```javascript
exports.functionName = async (req, res) => {
  try {
    // 1. Extract and validate input
    const { param } = req.body;
    if (!param) return sendError(res, "Message", HTTP_STATUS.BAD_REQUEST);

    // 2. Business logic
    const result = await Model.operation();

    // 3. Return success response
    return sendSuccess(res, result, "Success message");
  } catch (error) {
    // 4. Error handling
    logger.error("Error message", error);
    return sendError(res, "Error message", HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};
```

---

## 🚀 Getting Started for New Developers

1. **Read this file first** to understand controller responsibilities
2. **Check [`DEVELOPER_GUIDE.md`](DEVELOPER_GUIDE.md)** for architecture overview
3. **Review route files** to see URL mappings
4. **Check model files** to understand data structures
5. **Test APIs** using Postman or frontend

### Quick Reference

- **Auth Token Format:** `Bearer <jwt_token>`
- **Base URL:** `http://localhost:4000/api`
- **Content-Type:** `application/json`
- **Error Codes:** 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)

---

**Last Updated:** January 2026  
**Maintained By:** Development Team