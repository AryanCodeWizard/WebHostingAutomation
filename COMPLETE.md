
┌─────────────────────────────────────────────────────────────────┐
│                  COMPLETE PAYMENT FLOW                           │
└─────────────────────────────────────────────────────────────────┘

Step 1: User navigates to payment page
        └─→ /payment route in frontend

Step 2: Create Razorpay Order
        └─→ POST /api/payments/create-order
            ├─→ Validates invoice ID and amount
            ├─→ Creates Razorpay order (amount * 100)
            ├─→ Creates Transaction record (status: pending)
            └─→ Returns order object to frontend

Step 3: Open Razorpay Checkout
        └─→ Frontend opens Razorpay modal
            ├─→ User enters card details
            ├─→ Razorpay processes payment
            └─→ Returns payment_id, order_id, signature

Step 4: ✅ VERIFY PAYMENT (NEW!)
        └─→ POST /api/payments/verify-payment
            ├─→ Verifies signature using HMAC SHA256
            ├─→ Updates Transaction (status: success, paymentId)
            ├─→ Updates Invoice (status: paid)
            ├─→ Updates Order (status: completed)
            └─→ Returns success response

Step 5: Show Success & Redirect
        └─→ Frontend displays success message
            └─→ Redirects to /domains

Step 6: (Optional) Webhook Processing
        └─→ POST /api/webhooks/razorpay
            ├─→ Receives payment.captured event
            ├─→ Updates database records
            └─→ Attempts domain purchase (if applicable)


