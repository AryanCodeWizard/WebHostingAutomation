
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaServer, FaGlobe, FaShoppingCart, FaCode,
  FaCogs, FaMemory, FaDatabase,
  FaShieldAlt, FaTachometerAlt, FaEnvelope,
  FaSync, FaCheck, FaTimes, FaInfoCircle,
  FaCalendarAlt, FaTag
} from 'react-icons/fa';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedBilling, setSelectedBilling] = useState('monthly');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/products');
      console.log('Fetched products:', response.data);
      
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };


  // Filter products by type
  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(product => product.type === filter);

  // Get icon based on product type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'vps': return <FaServer className="text-blue-500" />;
      case 'hosting': return <FaGlobe className="text-green-500" />;
      case 'saas': return <FaCode className="text-purple-500" />;
      case 'domain': return <FaShoppingCart className="text-red-500" />;
      default: return <FaCogs className="text-gray-500" />;
    }
  };

  // Get color based on product type
  const getTypeColor = (type) => {
    switch (type) {
      case 'vps': return 'bg-blue-100 text-blue-800';
      case 'hosting': return 'bg-green-100 text-green-800';
      case 'saas': return 'bg-purple-100 text-purple-800';
      case 'domain': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format price with Indian Rupee symbol
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Render config options based on product type
  const renderConfigOptions = (config) => {
    const entries = Object.entries(config);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center text-sm">
            <div className="flex items-center flex-1">
              <FaInfoCircle className="text-gray-400 mr-2 flex-shrink-0" size={12} />
              <span className="text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
              </span>
            </div>
            <div className="text-gray-900 font-medium ml-2">
              {Array.isArray(value) ? (
                <div className="flex flex-wrap gap-1">
                  {value.map((item, idx) => (
                    <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              ) : typeof value === 'boolean' ? (
                value ? (
                  <span className="text-green-600 flex items-center">
                    <FaCheck className="mr-1" size={12} /> Yes
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <FaTimes className="mr-1" size={12} /> No
                  </span>
                )
              ) : (
                <span className="font-semibold">{value}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Cloud Hosting Solutions</h1>
          <p className="text-blue-100 text-lg">
            Choose from our range of hosting, VPS, SaaS, and domain solutions
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Filter Products</h2>
              <p className="text-gray-600">Select product type to filter</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                All Products ({products.length})
              </button>
              <button
                onClick={() => setFilter('hosting')}
                className={`px-4 py-2 rounded-full flex items-center ${filter === 'hosting' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                <FaGlobe className="mr-2" />
                Web Hosting
              </button>
              <button
                onClick={() => setFilter('vps')}
                className={`px-4 py-2 rounded-full flex items-center ${filter === 'vps' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                <FaServer className="mr-2" />
                VPS
              </button>
              <button
                onClick={() => setFilter('saas')}
                className={`px-4 py-2 rounded-full flex items-center ${filter === 'saas' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                <FaCode className="mr-2" />
                SaaS
              </button>
              <button
                onClick={() => setFilter('domain')}
                className={`px-4 py-2 rounded-full flex items-center ${filter === 'domain' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                <FaShoppingCart className="mr-2" />
                Domains
              </button>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-4">
              <span className="text-gray-700">Billing Cycle:</span>
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setSelectedBilling('monthly')}
                  className={`px-6 py-2 rounded-md ${selectedBilling === 'monthly' ? 'bg-white shadow text-blue-600' : 'text-gray-700'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedBilling('yearly')}
                  className={`px-6 py-2 rounded-md ${selectedBilling === 'yearly' ? 'bg-white shadow text-blue-600' : 'text-gray-700'}`}
                >
                  Yearly (Save up to 20%)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Product Header */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      {getTypeIcon(product.type)}
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(product.type)}`}>
                        {product.type.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{product.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedBilling === 'monthly' 
                        ? formatPrice(product.pricing.monthly)
                        : formatPrice(product.pricing.yearly)
                      }
                    </div>
                    <div className="text-gray-500 text-sm">
                      {selectedBilling === 'monthly' ? 'per month' : 'per year'}
                      {product.pricing.monthly === 0 && (
                        <span className="block text-green-600 font-semibold">FREE with yearly plan</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuration Options */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
                  <FaCogs className="mr-2 text-gray-400" />
                  Configuration Details
                </h4>
                {renderConfigOptions(product.configOptions)}
              </div>

              {/* Price Comparison */}
              <div className="bg-gray-50 p-4 border-t">
                <div className="flex justify-between items-center text-sm">
                  <div className="text-center">
                    <div className="text-gray-600">Monthly</div>
                    <div className="font-bold text-lg">{formatPrice(product.pricing.monthly)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Yearly</div>
                    <div className="font-bold text-lg">{formatPrice(product.pricing.yearly)}</div>
                    {product.pricing.monthly > 0 && (
                      <div className="text-xs text-green-600 font-semibold">
                        Save {Math.round((1 - product.pricing.yearly / (product.pricing.monthly * 12)) * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-gray-50 border-t">
                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center">
                    <FaShoppingCart className="mr-2" />
                    Add to Cart
                  </button>
                  <button className="px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold">
                    View Details
                  </button>
                </div>
                {selectedBilling === 'yearly' && product.pricing.monthly === 0 && (
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      <FaTag className="mr-1" />
                      Free domain with yearly purchase
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Showing {filteredProducts.length} of {products.length} Products
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {products.filter(p => p.type === 'hosting').length}
                </div>
                <div className="text-gray-600">Web Hosting Plans</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {products.filter(p => p.type === 'vps').length}
                </div>
                <div className="text-gray-600">VPS Servers</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {products.filter(p => p.type === 'saas').length}
                </div>
                <div className="text-gray-600">SaaS Solutions</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {products.filter(p => p.type === 'domain').length}
                </div>
                <div className="text-gray-600">Domain TLDs</div>
              </div>
            </div>
          </div>
        </div>

        {/* API Info */}
        <div className="mt-8 bg-gray-800 text-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FaServer className="text-green-400 mr-3" size={24} />
            <h4 className="text-xl font-semibold">API Information</h4>
          </div>
          <div className="bg-gray-900 p-4 rounded">
            <code className="text-sm">
              <span className="text-green-400">GET</span> http://localhost:4000/api/products
            </code>
            <div className="mt-2 text-gray-300 text-sm">
              Endpoint returns {products.length} products in JSON format
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;