import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
// import { domainAPI } from '../services/api';

const DomainChecker = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!domain.trim()) {
      setError('Please enter a domain name');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // const response = await domainAPI.checkDomain(domain.trim());
      const response = await fetch(`http://localhost:4000/api/domains/check?domain=${encodeURIComponent(domain.trim())}`);
      const data = await response.json();
      console.log("Domain Check Response:", data);
      
      // Backend returns data directly, not wrapped in {data: ...}
      setResult(data);
    } catch (err) {
      console.error("Domain Check Error:", err);
      setError(err.message || 'Failed to check domain availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Domain Availability Checker</h1>
        <p className="text-gray-600 mb-8">Check if your desired domain is available for registration</p>

        <form onSubmit={handleCheck} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain name (e.g., example.com)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Check Availability
                </>
              )}
            </button>
          </div>
        </form>

        {result && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Results for: {domain}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Availability</span>
                  {result.available ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>
                <p className={result.available ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {result.available ? 'Domain is available!' : 'Domain is not available'}
                </p>
              </div>

              {result.available && result.price && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Price (1st year)</span>
                    <span className="text-2xl font-bold text-indigo-600">${result.price}</span>
                  </div>
                  <p className="text-sm text-gray-500">Exclusive of taxes and fees</p>
                </div>
              )}

              {result.available && (
                <div className="md:col-span-2">
                  <button className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                    Register This Domain
                  </button>
                </div>
              )}
            </div>

            {!result.available && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">Domain Taken</h3>
                <p className="text-yellow-700">This domain is already registered. Try searching for alternatives or contact the owner.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="font-semibold text-indigo-900 mb-1">Quick Search</h3>
            <p className="text-sm text-indigo-700">.com, .net, .org domains</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-1">Instant Results</h3>
            <p className="text-sm text-green-700">Real-time availability check</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-1">Secure Registration</h3>
            <p className="text-sm text-purple-700">SSL & privacy protection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainChecker;