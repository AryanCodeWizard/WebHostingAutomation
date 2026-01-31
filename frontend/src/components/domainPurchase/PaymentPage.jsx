import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Payment from './Payment';

/**
 * Payment Page Component
 * This component handles the payment flow and receives invoice data from navigation state
 * or allows manual input for testing
 */
const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get invoice data from navigation state (passed from domain checkout)
  const invoiceFromState = location.state?.invoice;
  
  // State for invoice data
  const [invoiceId, setInvoiceId] = useState(invoiceFromState?.invoiceId || '');
  const [amount, setAmount] = useState(invoiceFromState?.amount || '');
  const [showManualEntry, setShowManualEntry] = useState(!invoiceFromState);

  const handlePaymentSuccess = (paymentData) => {
    console.log('✅ Payment Successful:', paymentData);
    alert('Payment successful! Your order is being processed.');
    
    // Redirect to domains page or order confirmation
    navigate('/domains', { 
      state: { 
        paymentSuccess: true, 
        paymentData 
      } 
    });
  };

  const handlePaymentFailure = (errorData) => {
    console.error('❌ Payment Failed:', errorData);
    alert(`Payment failed: ${errorData.message || 'Unknown error'}`);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (invoiceId && amount) {
      setShowManualEntry(false);
    }
  };

  // If showing manual entry form
  if (showManualEntry) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Enter Payment Details</h2>
          <p style={styles.subtitle}>
            {invoiceFromState 
              ? 'Invoice data loaded from checkout'
              : 'No invoice data found. Please enter manually for testing.'}
          </p>
          
          <form onSubmit={handleManualSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Invoice ID:</label>
              <input
                type="text"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="e.g., 65abc123def456789"
                style={styles.input}
                required
              />
              <small style={styles.hint}>
                MongoDB ObjectId or your invoice identifier
              </small>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Amount (₹):</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 999"
                min="1"
                style={styles.input}
                required
              />
              <small style={styles.hint}>
                Amount in Indian Rupees
              </small>
            </div>

            <button type="submit" style={styles.submitButton}>
              Proceed to Payment
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              style={styles.backButton}
            >
              ← Back to Home
            </button>
          </form>

          <div style={styles.testDataSection}>
            <h4>Test Data (For Development):</h4>
            <button
              type="button"
              onClick={() => {
                setInvoiceId('65abc123def456789');
                setAmount('999');
              }}
              style={styles.testButton}
            >
              Use Sample Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show payment component with invoice data
  return (
    <Payment
      invoiceId={invoiceId}
      amount={parseFloat(amount)}
      onSuccess={handlePaymentSuccess}
      onFailure={handlePaymentFailure}
    />
  );
};

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
    marginBottom: '10px',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '25px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.3s',
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic',
  },
  submitButton: {
    padding: '15px',
    backgroundColor: '#3399cc',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  backButton: {
    padding: '12px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  testDataSection: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    textAlign: 'center',
  },
  testButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default PaymentPage;
