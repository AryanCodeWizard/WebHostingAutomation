import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import clientService from '../services/clientService';
import api from '../services/axiosConfig';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, tax, total } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [clientProfile, setClientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [billingDetails, setBillingDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: '',
    address: '',
    gst: '',
  });

  useEffect(() => {
    // Fetch client profile
    const fetchProfile = async () => {
      try {
        const profile = await clientService.getMyProfile();
        setClientProfile(profile);
        setBillingDetails(prev => ({
          ...prev,
          company: profile.company || '',
          address: profile.address || '',
          gst: profile.gst || '',
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    fetchProfile();
  }, [items.length, navigate]);

  const handleChange = (e) => {
    setBillingDetails({ ...billingDetails, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = async () => {
    try {
      setProcessing(true);

      // Update client profile with billing details
      if (clientProfile) {
        await clientService.updateMyProfile({
          company: billingDetails.company,
          address: billingDetails.address,
          gst: billingDetails.gst,
        });
      }

      // Navigate to payment page with cart total
      navigate('/payment', {
        state: {
          amount: total,
          billingDetails,
        }
      });
    } catch (error) {
      console.error('Error processing checkout:', error);
      alert('Failed to proceed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <Link to="/cart" className="text-indigo-600 hover:text-indigo-800 font-medium">
              ← Back to Cart
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Billing Details Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Billing Details</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={billingDetails.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={billingDetails.email}
                      onChange={handleChange}
                      required
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={billingDetails.company}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Address *
                  </label>
                  <textarea
                    name="address"
                    value={billingDetails.address}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="Enter your complete address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="gst"
                    value={billingDetails.gst}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Order Summary</h2>
              </div>
              
              <div className="px-6 py-4">
                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.config?.domain && (
                          <p className="text-xs text-gray-500">{item.config.domain}</p>
                        )}
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold">Total</span>
                      <span className="text-xl font-bold text-indigo-600">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={handleProceedToPayment}
                  disabled={processing || !billingDetails.name || !billingDetails.address}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Proceed to Payment'}
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Your order will be created after successful payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
