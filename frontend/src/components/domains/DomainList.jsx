import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Calendar, Shield, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
// import { domainAPI } from '../services/api';

const DomainList = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      // const response = await domainAPI.getDomains();
      const response = await fetch('http://localhost:4000/api/domains').then(res => res.json());
      console.log("Domains API Response:", response);
      
      // Backend returns {success: true, message: '...', data: [...]}
      const domainData = response.data || response;
      setDomains(Array.isArray(domainData) ? domainData : []);
    } catch (err) {
      console.error("Error fetching domains:", err);
      setError(err.message || 'Failed to fetch domains');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiresAt) => {
    const expiry = new Date(expiresAt);
    const today = new Date();
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Domains</h1>
              <p className="text-gray-600">Manage all your registered domains in one place</p>
            </div>
            <button
              onClick={fetchDomains}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600" />
            <p className="mt-4 text-gray-600">Loading your domains...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
            <p className="mt-4 text-red-600">{error}</p>
            <button
              onClick={fetchDomains}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : domains.length === 0 ? (
          <div className="py-20 text-center">
            <Globe className="h-16 w-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No domains found</h3>
            <p className="mt-2 text-gray-600">You haven't registered any domains yet.</p>
            <Link
              to="/"
              className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Register Your First Domain
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auto Renew
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {domains.map((domain) => (
                  <tr key={domain.domainId || domain.domain} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-indigo-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{domain.domain}</div>
                          <div className="text-sm text-gray-500">Registered: {formatDate(domain.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        domain.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {domain.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{formatDate(domain.expiresAt)}</div>
                          <div className={`text-xs ${
                            getDaysUntilExpiry(domain.expiresAt) < 30 
                              ? 'text-red-600' 
                              : 'text-gray-500'
                          }`}>
                            {getDaysUntilExpiry(domain.expiresAt)} days remaining
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Shield className={`h-5 w-5 ${
                        domain.autoRenew ? 'text-green-500' : 'text-gray-400'
                      }`} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/dns/${domain.domain}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Manage DNS
                      </Link>
                      <button className="text-gray-600 hover:text-gray-900">
                        <ExternalLink className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{domains.length}</span> domains
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                Export List
              </button>
              <Link
                to="/"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Register New Domain
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainList;