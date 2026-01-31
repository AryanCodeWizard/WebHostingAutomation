import React, { useState } from 'react';
import Payment from './Payment';


const PaymentExample = () => {
  const [showPayment, setShowPayment] = useState(false);
  
  // Sample invoice data (replace with actual data from your app)
  const sampleInvoice = {
    invoiceId: '65abc123def456789', // MongoDB ObjectId or invoice ID
    amount: 999, // Amount in INR
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log('✅ Payment Successful:', paymentData);
  
    alert('Payment successful! Your order is being processed.');
    

    setShowPayment(false);
  };

  const handlePaymentFailure = (errorData) => {
    console.error('❌ Payment Failed:', errorData);
 
    alert(`Payment failed: ${errorData.message || 'Unknown error'}`);

  };

  return (
    <div style={styles.container}>
      {!showPayment ? (
        <div style={styles.card}>
          <h1 style={styles.title}>Domain Purchase</h1>
          
          <div style={styles.invoiceDetails}>
            <h3>Invoice Summary</h3>
            <div style={styles.row}>
              <span>Domain Registration</span>
              <span>₹799</span>
            </div>
            <div style={styles.row}>
              <span>Privacy Protection</span>
              <span>₹200</span>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.row}>
              <strong>Total Amount</strong>
              <strong>₹{sampleInvoice.amount}</strong>
            </div>
          </div>

          <button 
            onClick={() => setShowPayment(true)}
            style={styles.button}
          >
            Proceed to Payment
          </button>
        </div>
      ) : (
        <Payment
          invoiceId={sampleInvoice.invoiceId}
          amount={sampleInvoice.amount}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </div>
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
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center',
  },
  invoiceDetails: {
    marginBottom: '25px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    color: '#555',
  },
  divider: {
    borderTop: '2px solid #ddd',
    margin: '15px 0',
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
};

export default PaymentExample;
