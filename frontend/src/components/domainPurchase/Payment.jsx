import React, { useState } from 'react';
import axios from 'axios';

const Payment = ({ invoiceId, amount, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  // Load Razorpay script dynamically (backup if not loaded from HTML)
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Create Razorpay Order
  const createOrder = async () => {
    try {
      console.log('Creating order with:', { invoiceId, amount });
      const response = await axios.post(`${API_URL}/api/payments/create-order`, {
        invoiceId,
        amount,
      });
      console.log('Order created successfully:', response.data);
      return response.data;
    } catch (err) {
      console.error('Order creation error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create order';
      throw new Error(errorMessage);
    }
  };

  // Handle Payment
  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setPaymentStatus(null);

    try {
      // Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order on backend
      const order = await createOrder();

      // Razorpay Checkout Options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'WHMCS Platform',
        description: `Payment for Invoice #${invoiceId}`,
        order_id: order.id,
        handler: async function (response) {
          // Payment successful
          console.log('Payment Success:', response);
          setPaymentStatus('success');
          setLoading(false);
          
          // Call success callback if provided
          if (onSuccess) {
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          invoice_id: invoiceId,
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment cancelled by user');
            setPaymentStatus('cancelled');
            
            if (onFailure) {
              onFailure({ message: 'Payment cancelled' });
            }
          },
        },
      };

      // Open Razorpay Checkout
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('Payment Failed:', response.error);
        setLoading(false);
        setError(response.error.description || 'Payment failed');
        setPaymentStatus('failed');
        
        if (onFailure) {
          onFailure({
            code: response.error.code,
            description: response.error.description,
            reason: response.error.reason,
          });
        }
      });

      rzp.open();
    } catch (err) {
      console.error('Payment Error:', err);
      setError(err.message);
      setPaymentStatus('error');
      setLoading(false);
      
      if (onFailure) {
        onFailure({ message: err.message });
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Payment Details</h2>
        
        <div style={styles.details}>
          <div style={styles.row}>
            <span style={styles.label}>Invoice ID:</span>
            <span style={styles.value}>{invoiceId || 'N/A'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Amount:</span>
            <span style={styles.value}>₹{amount || 0}</span>
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {paymentStatus === 'success' && (
          <div style={styles.success}>
            ✅ Payment successful! Your order is being processed.
          </div>
        )}

        {paymentStatus === 'cancelled' && (
          <div style={styles.warning}>
            ⚠️ Payment was cancelled. Please try again.
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div style={styles.error}>
            ❌ Payment failed. Please try again or contact support.
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading || !invoiceId || !amount}
          style={{
            ...styles.button,
            ...(loading || !invoiceId || !amount ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>

        <p style={styles.info}>
          💳 Secure payment powered by Razorpay
        </p>
      </div>
    </div>
  );
};

// Inline Styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '30px',
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center',
  },
  details: {
    marginBottom: '25px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },
  value: {
    color: '#333',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#3399cc',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '15px',
    border: '1px solid #fcc',
  },
  success: {
    backgroundColor: '#efe',
    color: '#3c3',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '15px',
    border: '1px solid #cfc',
  },
  warning: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '15px',
    border: '1px solid #ffeaa7',
  },
  info: {
    textAlign: 'center',
    marginTop: '15px',
    color: '#777',
    fontSize: '14px',
  },
};

export default Payment;