import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Globe, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
// import { domainAPI } from '../services/api';

const ARecordUpdater = () => {
  const { domain } = useParams();
  const navigate = useNavigate();
  const [ip, setIp] = useState('');
  const [currentARecord, setCurrentARecord] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dnsRecords, setDnsRecords] = useState([]);

  useEffect(() => {
    if (domain) {
      fetchDNSRecords();
    }
  }, [domain]);

  const fetchDNSRecords = async () => {
    try {
      setLoading(true);
      // const response = await domainAPI.getDNSRecords(domain);
      const response = await fetch(`http://localhost:4000/api/domains/${encodeURIComponent(domain)}/dns`).then(res => res.json()); 
      console.log("A Record - DNS Response:", response);
      const records = Array.isArray(response) ? response : [];
      setDnsRecords(records);
      
      // Find existing A record
      const aRecord = records.find(record => record.type === 'A' && (record.name === '@' || record.name === ''));
      if (aRecord) {
        setCurrentARecord(aRecord.data);
        setIp(aRecord.data);
      }
    } catch (err) {
      setError('Failed to fetch DNS records');
    } finally {
      setLoading(false);
    }
  };

  const validateIP = (ip) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(ip)) return false;
    
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateIP(ip)) {
      setError('Please enter a valid IPv4 address (e.g., 192.168.1.1)');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:4000/api/domains/${encodeURIComponent(domain)}/a-record`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip })
      });
      if (!response.ok) throw new Error('Failed to update A record');
      setSuccess('A record updated successfully!');
      setCurrentARecord(ip);
      
      // Refresh DNS records
      setTimeout(() => {
        fetchDNSRecords();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update A record');
    } finally {
      setUpdating(false);
    }
  };

  const getARecommendations = () => {
    return [
      { ip: '192.168.1.1', label: 'Local Network' },
      { ip: '10.0.0.1', label: 'Private Network' },
      { ip: '172.217.14.206', label: 'Google (Example)' },
      { ip: '93.184.216.34', label: 'Example.com' },
    ];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/dns')}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to DNS Manager
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Update A Record</h1>
              <p className="text-indigo-100 mt-1">Point your domain to a new IP address</p>
            </div>
            <Globe className="h-12 w-12 text-white opacity-80" />
          </div>
        </div>

        <div className="p-8">
          {/* Domain Info */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{domain}</h2>
                <p className="text-gray-600 mt-1">A record controls where your domain points to</p>
              </div>
              {currentARecord && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">Current A Record</div>
                  <div className="text-lg font-mono font-bold text-indigo-600">{currentARecord}</div>
                </div>
              )}
            </div>
          </div>

          {/* Update Form */}
          <div className="mb-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New IP Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="Enter IPv4 address (e.g., 192.168.1.1)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-mono"
                  />
                  <div className="absolute right-3 top-3 text-sm text-gray-500">
                    IPv4
                  </div>
                </div>
                {error && (
                  <div className="mt-2 flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="mt-2 flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">{success}</span>
                  </div>
                )}
              </div>

              {/* Quick IP Suggestions */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Suggestions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getARecommendations().map((rec) => (
                    <button
                      key={rec.ip}
                      type="button"
                      onClick={() => setIp(rec.ip)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition text-left"
                    >
                      <div className="font-mono font-medium text-gray-900">{rec.ip}</div>
                      <div className="text-sm text-gray-500">{rec.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* A Record Info */}
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">About A Records</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• A records map domain names to IPv4 addresses</li>
                  <li>• Changes can take up to 48 hours to propagate globally</li>
                  <li>• TTL (Time to Live) is set to 600 seconds (10 minutes)</li>
                  <li>• Use @ for the root domain (e.g., example.com)</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {loading ? 'Loading...' : updating ? 'Updating...' : 'Ready to update'}
                </div>
                <button
                  type="submit"
                  disabled={updating || loading || !ip.trim()}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Update A Record
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Existing DNS Records */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current DNS Records for {domain}</h3>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
              </div>
            ) : dnsRecords.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600">No DNS records found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dnsRecords
                  .filter(record => record.type === 'A')
                  .map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                            {record.type}
                          </span>
                          <span className="font-medium">{record.name || '@'}</span>
                        </div>
                        <div className="mt-1 font-mono text-sm text-gray-600">{record.data}</div>
                      </div>
                      <div className="text-sm text-gray-500">TTL: {record.ttl}s</div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARecordUpdater;