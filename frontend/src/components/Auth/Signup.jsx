import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signup, sendOtp, clearErrors } from '../../features/userSlice';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaGithub, FaKey } from 'react-icons/fa';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    systemRole: 'client' // Default role
  });
  const [otpSent, setOtpSent] = useState(false);
  const [localError, setLocalError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError(''); // Clear local error on change
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setLocalError('Please enter an email address to receive OTP');
      return;
    }
    try {
      await dispatch(sendOtp(formData.email)).unwrap();
      setOtpSent(true);
      setLocalError('');
      alert('OTP sent successfully!');
      // console.log(formData.otp);

    } catch (err) {
      setLocalError(err.message || 'Failed to send OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(otpSent);

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (!otpSent) {
      setLocalError("Please verify your email with OTP first");
      return;
    }

    try {
      await dispatch(signup(formData)).unwrap();
      navigate('/login');
    } catch (err) {
      // Redux handles the error state, but we can also set local error if needed
      // console.error("Signup failed", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full flex rounded-2xl shadow-xl overflow-hidden bg-white">
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 relative z-10 bg-white">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Create Account
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Join us to start your journey
            </p>
          </div>

          {(localError || error) && (
            <div className="mt-2 text-sm text-red-600 text-center bg-red-50 p-2 rounded">
              {localError || (typeof error === 'string' ? error : error?.message || 'An error occurred')}
            </div>
          )}

          <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-3">
              {/* Name Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 sm:text-sm bg-gray-50 focus:bg-white"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email Field with OTP Button */}
              <div className="flex gap-2">
                <div className="relative group flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 sm:text-sm bg-gray-50 focus:bg-white"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={otpSent}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || otpSent}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg text-white ${otpSent
                    ? "bg-green-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                    } transition-colors duration-200 whitespace-nowrap`}
                >
                  {loading && !otpSent ? 'Sending...' : otpSent ? 'OTP Sent' : 'Get OTP'}
                </button>
              </div>

              {/* OTP Field (Conditionally Rendered or Enabled) */}
              {otpSent && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 sm:text-sm bg-gray-50 focus:bg-white"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Password Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 sm:text-sm bg-gray-50 focus:bg-white"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Confirm Password Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 sm:text-sm bg-gray-50 focus:bg-white"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Sign up'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaGoogle className="h-5 w-5 text-red-500" />
                </a>
              </div>
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaGithub className="h-5 w-5 text-gray-900" />
                </a>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-purple-600 transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div >

        {/* Right Side: Image */}
        < div className="hidden md:block w-1/2 relative bg-gray-100" >
          <img
            src="https://i.pinimg.com/1200x/0c/9b/89/0c9b89b62ba04b4b4740f4ce2da28b54.jpg"
            alt="Signup Visual"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-purple-900 opacity-20"></div>
        </div >
      </div >
    </div >
  );
};

export default Signup;