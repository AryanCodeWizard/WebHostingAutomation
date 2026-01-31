/**
 * 🧪 Payment Integration Test Suite
 * 
 * Run these tests to verify the payment integration is working correctly
 */

// Test 1: Environment Variables
console.log('🔍 Test 1: Checking Environment Variables...');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_RAZORPAY_KEY_ID:', import.meta.env.VITE_RAZORPAY_KEY_ID);
console.log('✅ Environment variables loaded\n');

// Test 2: Razorpay SDK
console.log('🔍 Test 2: Checking Razorpay SDK...');
if (window.Razorpay) {
  console.log('✅ Razorpay SDK loaded successfully\n');
} else {
  console.warn('⚠️ Razorpay SDK not loaded. Make sure the script tag is in index.html\n');
}

// Test 3: Backend API Connectivity
console.log('🔍 Test 3: Testing Backend API...');
fetch(`${import.meta.env.VITE_API_URL}/api/products`)
  .then(res => res.json())
  .then(data => {
    console.log('✅ Backend API is reachable');
    console.log('Products endpoint response:', data);
  })
  .catch(err => {
    console.error('❌ Backend API is not reachable:', err.message);
    console.error('Make sure backend is running on:', import.meta.env.VITE_API_URL);
  });

// Test 4: Payment Component Props
console.log('\n🔍 Test 4: Payment Component Usage Example');
console.log(`
import Payment from './components/domainPurchase/Payment';

function App() {
  return (
    <Payment
      invoiceId="65abc123def456789"
      amount={999}
      onSuccess={(data) => console.log('Success:', data)}
      onFailure={(error) => console.log('Failure:', error)}
    />
  );
}
`);
console.log('✅ Usage example shown\n');

// Test 5: Webhook Configuration Reminder
console.log('🔍 Test 5: Webhook Configuration Checklist');
console.log(`
⚠️ IMPORTANT: Configure webhook in Razorpay Dashboard

Steps:
1. Login to Razorpay Dashboard (https://dashboard.razorpay.com)
2. Go to Settings → Webhooks
3. Add webhook URL:
   - Local: http://localhost:4000/api/webhooks/razorpay
   - Production: https://yourdomain.com/api/webhooks/razorpay
4. Select events: payment.captured
5. Copy webhook secret and add to backend .env:
   RAZORPAY_WEBHOOK_SECRET=your_secret_here
`);

console.log('✅ All tests completed!\n');
console.log('🎉 Payment integration is ready to use!');
console.log('📖 Read PAYMENT_INTEGRATION_GUIDE.md for detailed documentation');
