import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Server, Globe, Filter, RefreshCw, Loader2, Plus, AlertCircle } from 'lucide-react';
// import { domainAPI } from '../services/api';

const DNSManager = () => {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [domains, setDomains] = useState([]);
  const [dnsRecords, setDnsRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setLoadingDomains(true);
      // const response = await domainAPI.getDomains();
      const response  = await fetch('http://localhost:4000/api/domains').then(res => res.json());
      console.log("DNS Manager - Domains Response:", response);
      setDomains(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("DNS Manager - Error:", err);
      setError('Failed to fetch domains');
    } finally {
      setLoadingDomains(false);
    }
  };

  const fetchDNSRecords = async (domain) => {
    if (!domain) return;

    setLoading(true);
    setError('');
    setSelectedDomain(domain);

    try {
      const response = await fetch(`http://localhost:4000/api/domains/${encodeURIComponent(domain)}/dns`).then(res => res.json());
      console.log("DNS Records Response:", response);
      setDnsRecords(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("DNS Records Error:", err);
      setError(err.message || 'Failed to fetch DNS records');
      setDnsRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getRecordIcon = (type) => {
    const icons = {
      A: '🌐',
      CNAME: '🔗',
      MX: '📧',
      TXT: '📝',
      NS: '🏢',
      SRV: '🔌',
      AAAA: '🔷',
    };
    return icons[type] || '📄';
  };

  const handleManageDomain = () => {
    if (selectedDomain) {
      navigate(`/dns/${selectedDomain}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DNS Management</h1>
              <p className="text-gray-600">Configure DNS records for your domains</p>
            </div>
            <Server className="h-10 w-10 text-indigo-600" />
          </div>
        </div>

        <div className="p-8">
          {/* Domain Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Select a Domain
              </label>
              <button
                onClick={fetchDomains}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Domains
              </button>
            </div>
            
            {loadingDomains ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading domains...</span>
              </div>
            ) : domains.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Globe className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-600">No domains found</p>
                <Link
                  to="/"
                  className="mt-2 inline-block text-indigo-600 hover:text-indigo-800"
                >
                  Register your first domain →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {domains.map((domain) => (
                  <button
                    key={domain.domain}
                    onClick={() => fetchDNSRecords(domain.domain)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedDomain === domain.domain
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-500 mr-3" />
                        <span className="font-medium text-gray-900">{domain.domain}</span>
                      </div>
                      {selectedDomain === domain.domain && (
                        <div className="h-3 w-3 bg-indigo-600 rounded-full"></div>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {domain.status || 'Active'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DNS Records */}
          {selectedDomain && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    DNS Records for {selectedDomain}
                  </h2>
                  <p className="text-gray-600">Manage your domain's DNS configuration</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => fetchDNSRecords(selectedDomain)}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={handleManageDomain}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Record
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
                  <p className="mt-2 text-gray-600">Loading DNS records...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                  <h3 className="mt-2 text-lg font-medium text-red-800">Error Loading Records</h3>
                  <p className="mt-1 text-red-600">{error}</p>
                </div>
              ) : dnsRecords.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Server className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No DNS Records Found</h3>
                  <p className="mt-1 text-gray-600">This domain doesn't have any DNS records yet.</p>
                  <button
                    onClick={handleManageDomain}
                    className="mt-4 inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Record
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name/Host
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value/Data
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            TTL
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dnsRecords.map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-lg mr-2">{getRecordIcon(record.type)}</span>
                                <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                                  {record.type}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {record.name || '@'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 font-mono break-all">
                                {record.data || record.value}
                              </div>
                              {record.priority && (
                                <div className="text-xs text-gray-500">Priority: {record.priority}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.ttl} seconds
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Showing {dnsRecords.length} DNS records
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                          <option>All Record Types</option>
                          <option>A Records</option>
                          <option>CNAME Records</option>
                          <option>MX Records</option>
                          <option>TXT Records</option>
                        </select>
                      </div>
                      <Link
                        to={`/dns/${selectedDomain}`}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Update A Record
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DNSManager;