import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCart } from '../features/cartSlice';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      navigate('/dashboard');
      return;
    }

    // Refresh cart (should be empty now)
    dispatch(fetchCart());
  }, [orderData, navigate, dispatch]);

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Order Confirmation</h1>
            <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="bg-green-50 px-6 py-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-lg text-gray-600">Thank you for your order. Your payment has been processed.</p>
          </div>

          <div className="px-6 py-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                <p className="text-lg font-semibold text-gray-900">{orderData.orderId}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Invoice Number</p>
                <p className="text-lg font-semibold text-gray-900">{orderData.invoiceId}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                <p className="text-lg font-semibold text-green-600">₹{orderData.amount?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {orderData.items && orderData.items.length > 0 && (
            <div className="px-6 py-6">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.config?.domain && (
                        <p className="text-sm text-gray-500">Domain: {item.config.domain}</p>
                      )}
                      {item.config?.period && (
                        <p className="text-xs text-gray-400">Period: {item.config.period} year(s)</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">Qty: {item.qty || 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* What's Next */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Your order is being processed and domains are being registered</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>You'll receive an email confirmation shortly</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Domain registration typically completes within a few minutes</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0121 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2c1.657 0 3.22.377 4.618 1.016" />
              </svg>
              <span>You can manage your domains from the "My Domains" section</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/domains"
            className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View My Domains
          </Link>
          <Link
            to="/domain-checker"
            className="flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Register More Domains
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about your order, please contact our support team.
          </p>
          <a
            href="mailto:support@example.com"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            support@example.com
          </a>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
