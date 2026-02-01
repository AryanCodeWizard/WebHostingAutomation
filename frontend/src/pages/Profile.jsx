import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../features/userSlice';
import clientService from '../services/clientService';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [isClientEditing, setIsClientEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientProfile, setClientProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [clientFormData, setClientFormData] = useState({
    company: '',
    address: '',
    gst: '',
  });

  // Fetch client profile on mount
  useEffect(() => {
    const fetchClientProfile = async () => {
      try {
        const profile = await clientService.getMyProfile();
        setClientProfile(profile);
        setClientFormData({
          company: profile.company || '',
          address: profile.address || '',
          gst: profile.gst || '',
        });
      } catch (error) {
        console.error('Error fetching client profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClientChange = (e) => {
    setClientFormData({ ...clientFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    alert('Profile update functionality - Connect to backend API');
    setIsEditing(false);
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = await clientService.updateMyProfile(clientFormData);
      setClientProfile(updatedProfile);
      setIsClientEditing(false);
      alert('Client profile updated successfully!');
    } catch (error) {
      console.error('Error updating client profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800">
                ← Back to Dashboard
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-12">
            <div className="flex items-center">
              <div className="bg-white rounded-full p-2">
                <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-white">{user?.name || 'User'}</h1>
                <p className="text-indigo-100">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-md">
                    <span className="capitalize text-gray-700">{user?.role || 'Client'}</span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex border-b border-gray-200 pb-4">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Full Name</div>
                  <div className="w-2/3 text-sm text-gray-900">{user?.name || 'Not set'}</div>
                </div>
                <div className="flex border-b border-gray-200 pb-4">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Email</div>
                  <div className="w-2/3 text-sm text-gray-900">{user?.email}</div>
                </div>
                <div className="flex border-b border-gray-200 pb-4">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Account Type</div>
                  <div className="w-2/3 text-sm text-gray-900 capitalize">{user?.role || 'Client'}</div>
                </div>
                <div className="flex pb-4">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Member Since</div>
                  <div className="w-2/3 text-sm text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Client Business Information Section */}
          <div className="px-6 py-8 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
              {!isClientEditing && !loading && (
                <button
                  onClick={() => setIsClientEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Edit Business Info
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : isClientEditing ? (
              <form onSubmit={handleClientSubmit} className="space-y-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={clientFormData.company}
                    onChange={handleClientChange}
                    placeholder="Enter your company name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={clientFormData.address}
                    onChange={handleClientChange}
                    placeholder="Enter your business address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="gst" className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    id="gst"
                    name="gst"
                    type="text"
                    value={clientFormData.gst}
                    onChange={handleClientChange}
                    placeholder="Enter GST number (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsClientEditing(false);
                      setClientFormData({
                        company: clientProfile?.company || '',
                        address: clientProfile?.address || '',
                        gst: clientProfile?.gst || '',
                      });
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex border-b border-gray-200 pb-4">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Company Name</div>
                  <div className="w-2/3 text-sm text-gray-900">
                    {clientProfile?.company || <span className="text-gray-400 italic">Not set</span>}
                  </div>
                </div>
                <div className="flex border-b border-gray-200 pb-4">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Address</div>
                  <div className="w-2/3 text-sm text-gray-900">
                    {clientProfile?.address || <span className="text-gray-400 italic">Not set</span>}
                  </div>
                </div>
                <div className="flex border-b border-gray-200 pb-4">
                  <div className="w-1/3 text-sm font-medium text-gray-500">GST Number</div>
                  <div className="w-2/3 text-sm text-gray-900">
                    {clientProfile?.gst || <span className="text-gray-400 italic">Not set</span>}
                  </div>
                </div>
                <div className="flex pb-4">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Wallet Balance</div>
                  <div className="w-2/3 text-sm font-semibold text-green-600">
                    ₹{clientProfile?.walletBalance?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security Section */}
          <div className="px-6 py-8 bg-gray-50 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">
                      {user?.twoFAEnabled ? 'Enabled' : 'Not enabled'}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
