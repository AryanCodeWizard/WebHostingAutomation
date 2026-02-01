import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/axiosConfig';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, billingDetails } = location.state || {};
  const { items } = useSelector((state) => state.cart);

  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (!amount || items.length === 0) {
      navigate('/cart');
      return;
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      alert('Failed to load payment gateway. Please try again.');
      navigate('/checkout');
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [amount, items.length, navigate]);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      alert('Payment gateway is loading. Please wait...');
      return;
    }

    try {
      setLoading(true);

      // Create Razorpay order
      const orderResponse = await api.post('/payments/create-order', {
        amount,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          config: item.config
        }))
      });

      // Extract order data from wrapped response {success, message, data}
      const razorpayOrder = orderResponse.data.data || orderResponse.data;
      
      console.log('Razorpay order created:', razorpayOrder);

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RXgFDxf85u97LY',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'WHMCS Domain Registration',
        description: 'Domain Registration Payment',
        order_id: razorpayOrder.id,
        prefill: {
          name: billingDetails?.name || '',
          email: billingDetails?.email || '',
        },
        theme: {
          color: '#4F46E5'
        },
        handler: async function (response) {
          try {
            // Prepare items for verification
            const verifyItems = items.map(item => ({
              productId: item.productId,
              name: item.name,
              qty: item.quantity,
              price: item.price,
              config: item.config
            }));

            console.log('Sending payment verification:', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              items: verifyItems,
              billingDetails
            });

            // Verify payment and create order/invoice
            const verifyResponse = await api.post('/payments/verify-and-complete', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: verifyItems,
              billingDetails
            });

            console.log('✅ Payment successful:', verifyResponse.data);

            // Navigate to order confirmation
            navigate('/order-confirmation', {
              state: {
                orderData: {
                  orderId: verifyResponse.data.order?._id,
                  invoiceId: verifyResponse.data.invoice?._id,
                  amount: amount,
                  items: items.map(item => ({
                    name: item.name,
                    qty: item.quantity,
                    config: item.config
                  }))
                }
              }
            });
          } catch (error) {
            console.error('❌ Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('❌ Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  if (!amount) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
            <Link to="/checkout" className="text-indigo-600 hover:text-indigo-800 font-medium">
              ← Back to Checkout
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0121 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2c1.657 0 3.22.377 4.618 1.016" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h2>
            <p className="text-gray-600">Secure payment powered by Razorpay</p>
          </div>

          {/* Amount to Pay */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg text-gray-600">Amount to Pay:</span>
              <span className="text-3xl font-bold text-indigo-600">₹{amount.toFixed(2)}</span>
            </div>
            
            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Summary:</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <p className="text-gray-700">{item.name}</p>
                      {item.config?.domain && (
                        <p className="text-xs text-gray-500">{item.config.domain}</p>
                      )}
                    </div>
                    <span className="text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Billing Details */}
          {billingDetails && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Billing To:</h3>
              <p className="text-sm text-gray-600">{billingDetails.name}</p>
              <p className="text-sm text-gray-600">{billingDetails.email}</p>
              {billingDetails.company && (
                <p className="text-sm text-gray-600">{billingDetails.company}</p>
              )}
              {billingDetails.address && (
                <p className="text-sm text-gray-600">{billingDetails.address}</p>
              )}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !razorpayLoaded}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : razorpayLoaded ? 'Pay Now' : 'Loading Payment Gateway...'}
          </button>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 Your payment is secure and encrypted. We never store your card details.
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Accepted Payment Methods</h3>
          <div className="flex justify-center items-center space-x-4 text-xs text-gray-500">
            <span>💳 Credit Card</span>
            <span>•</span>
            <span>💳 Debit Card</span>
            <span>•</span>
            <span>🏦 Net Banking</span>
            <span>•</span>
            <span>📱 UPI</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
