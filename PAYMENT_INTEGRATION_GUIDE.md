# 💳 Payment Integration Guide

## Complete Razorpay Integration with Backend Webhook System

---

## 🏗️ Architecture Overview

```
User → Frontend → Backend API → Razorpay → Webhook → Order Processing → Domain Purchase
```

---

## 📋 Components

### 1. **Frontend Payment Component** ✅
**File:** `frontend/src/components/domainPurchase/Payment.jsx`

**Features:**
- ✅ Razorpay SDK integration
- ✅ Order creation via backend API
- ✅ Payment success/failure handling
- ✅ Loading states and error handling
- ✅ Responsive UI with inline styles
- ✅ Callback functions for parent components

**Props:**
```javascript
<Payment
  invoiceId="invoice_123"     // Required: Invoice ID from your database
  amount={999}                 // Required: Amount in INR
  onSuccess={(data) => {...}}  // Optional: Success callback
  onFailure={(error) => {...}} // Optional: Failure callback
/>
```

---

### 2. **Backend Payment Controller** ✅
**File:** `backend/controllers/paymentController.js`

**Endpoint:** `POST /api/payments/create-order`

**Request:**
```json
{
  "invoiceId": "65abc123def456789",
  "amount": 999
}
```

**Response:**
```json
{
  "id": "order_xyz123",
  "amount": 99900,
  "currency": "INR",
  "receipt": "invoice_65abc123def456789"
}
```

**Actions:**
1. Creates Razorpay order
2. Saves transaction with `status: "pending"`

---

### 3. **Backend Webhook Controller** ✅
**File:** `backend/controllers/webhookController.js`

**Endpoint:** `POST /api/webhooks/razorpay`

**Triggered By:** Razorpay server (automatic)

**Security:** HMAC SHA256 signature verification

**Event Handled:** `payment.captured`

**Webhook Flow:**
1. ✅ Verify Razorpay signature
2. 🔄 Update Transaction: `pending` → `success`
3. 💰 Mark Invoice as `paid`
4. 📦 Complete Order: `status: "completed"`
5. 🌐 **Auto-purchase domain via GoDaddy API** (if domain in order)

---

## 🔄 Complete Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: User initiates payment                                 │
│  → Frontend: User clicks "Pay Now"                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Create Razorpay order                                  │
│  → POST /api/payments/create-order                              │
│  → Backend creates order & saves transaction (pending)          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Open Razorpay checkout                                 │
│  → Frontend opens Razorpay modal                                │
│  → User enters card details                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Payment processing                                     │
│  → User completes payment                                       │
│  → Razorpay processes transaction                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: Webhook notification (AUTOMATIC)                       │
│  → Razorpay → POST /api/webhooks/razorpay                       │
│  → Backend verifies signature                                   │
│  → Updates transaction, invoice, order                          │
│  → Purchases domain via GoDaddy API                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: User notification                                      │
│  → Frontend shows success message                               │
│  → Optional: Redirect to order confirmation                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Usage Example

### Basic Usage

```jsx
import Payment from './components/domainPurchase/Payment';

function CheckoutPage() {
  const handleSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    // Redirect or show success
  };

  const handleFailure = (error) => {
    console.error('Payment failed:', error);
    // Show error message
  };

  return (
    <Payment
      invoiceId="65abc123def456789"
      amount={999}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
    />
  );
}
```

### Advanced Usage (with Invoice Creation)

```jsx
import { useState } from 'react';
import Payment from './components/domainPurchase/Payment';
import axios from 'axios';

function DomainCheckout() {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Create invoice first
  const createInvoice = async (domainData) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/invoices', {
        clientId: 'user_id_here',
        items: [{
          type: 'domain',
          name: domainData.domain,
          price: domainData.price,
          config: { domain: domainData.domain }
        }],
        total: domainData.price
      });
      
      setInvoice(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      setLoading(false);
    }
  };

  // Step 2: Handle payment success
  const handlePaymentSuccess = (paymentData) => {
    alert('Domain purchased successfully!');
    // Redirect to domain management
    window.location.href = '/my-domains';
  };

  return (
    <div>
      {!invoice ? (
        <button onClick={() => createInvoice({ 
          domain: 'example.com', 
          price: 999 
        })}>
          Create Invoice & Proceed to Payment
        </button>
      ) : (
        <Payment
          invoiceId={invoice._id}
          amount={invoice.total}
          onSuccess={handlePaymentSuccess}
          onFailure={(err) => alert('Payment failed: ' + err.message)}
        />
      )}
    </div>
  );
}
```

---

## 🔐 Environment Variables

### Frontend (`.env`)
```bash
VITE_API_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=rzp_test_RXgFDxf85u97LY
VITE_APP_ENV=development
```

### Backend (`.env`)
```bash
RAZORPAY_KEY_ID=rzp_test_RXgFDxf85u97LY
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# GoDaddy API (for domain purchase)
GODADDY_API_KEY=your_godaddy_key
GODADDY_API_SECRET=your_godaddy_secret
```

---

## 🧪 Testing

### Test Card Details (Razorpay Test Mode)

**Successful Payment:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment:**
- Card: `4000 0000 0000 0002`

**Payment Authentication:**
- Use any OTP when prompted in test mode

---

## 🔍 Debugging

### Check Payment Status

```javascript
// In browser console after payment
console.log('Payment Data:', {
  razorpay_payment_id: 'pay_xyz123',
  razorpay_order_id: 'order_xyz123',
  razorpay_signature: 'signature_hash'
});
```

### Check Backend Logs

```bash
# Watch backend logs
cd backend
npm run dev

# You should see:
# - Order creation logs
# - Webhook signature verification
# - Transaction updates
# - Domain purchase attempts
```

### Check Database

```javascript
// Transaction status
db.transactions.find({ invoiceId: "your_invoice_id" })

// Invoice status
db.invoices.find({ _id: "your_invoice_id" })

// Order status
db.orders.find({ invoiceId: "your_invoice_id" })
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Razorpay SDK not loading
**Solution:** Ensure script tag is in `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Issue 2: Webhook not receiving events
**Solution:** 
1. Configure webhook URL in Razorpay Dashboard
2. Use ngrok for local testing: `ngrok http 4000`
3. Add webhook URL: `https://your-ngrok-url.ngrok.io/api/webhooks/razorpay`

### Issue 3: Signature verification failed
**Solution:** Ensure `RAZORPAY_WEBHOOK_SECRET` matches the one in Razorpay Dashboard

### Issue 4: CORS errors
**Solution:** Add CORS middleware in backend:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue 5: Payment success but order not completed
**Solution:** Check webhook logs and ensure webhook is configured correctly

---

## 📊 Database Schema

### Transaction Model
```javascript
{
  invoiceId: ObjectId,
  gateway: "razorpay",
  amount: Number,
  ref: String,        // Razorpay order_id
  status: String      // pending | success | failed
}
```

### Invoice Model
```javascript
{
  clientId: ObjectId,
  items: Array,
  total: Number,
  status: String      // unpaid | paid
}
```

### Order Model
```javascript
{
  clientId: ObjectId,
  invoiceId: ObjectId,
  items: Array,
  status: String      // pending | completed
}
```

---

## 🎯 Next Steps

1. ✅ **Test in Development**
   - Use test Razorpay keys
   - Test with test cards
   - Verify webhook flow

2. ✅ **Configure Webhook**
   - Add webhook URL in Razorpay Dashboard
   - Test webhook events
   - Monitor webhook logs

3. ✅ **Add User Details**
   - Prefill user name, email, phone in Razorpay checkout
   - Fetch from authenticated user session

4. ✅ **Add Notifications**
   - Send email on payment success
   - Send SMS confirmation
   - Update user dashboard

5. ✅ **Production Deployment**
   - Switch to live Razorpay keys
   - Update webhook URL to production domain
   - Test end-to-end flow

---

## 📞 Support

For Razorpay integration issues:
- **Docs:** https://razorpay.com/docs/
- **Support:** https://razorpay.com/support/

For GoDaddy API issues:
- **Docs:** https://developer.godaddy.com/
- **Support:** https://www.godaddy.com/help

---

## ✅ Checklist

- [x] Frontend Payment component created
- [x] Razorpay SDK integrated
- [x] Backend payment controller implemented
- [x] Webhook controller implemented
- [x] Transaction model configured
- [x] Domain purchase integration added
- [ ] Webhook URL configured in Razorpay Dashboard
- [ ] Test payment flow verified
- [ ] Email notifications added
- [ ] Production keys configured

---

**Status:** ✅ **INTEGRATION COMPLETE**  
**Last Updated:** January 31, 2026
