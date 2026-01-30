import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaGithub } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearErrors } from '../../features/userSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      // navigate('/dashboard'); // Or wherever you want to redirect
      navigate('/')
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      await dispatch(login({ email, password })).unwrap();
      // navigate('/dashboard'); // explicit navigation on success
      navigate('/')
    } catch (err) {
      // Redux handles error state
      // console.error("Login failed", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full flex rounded-2xl shadow-xl overflow-hidden bg-white">
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 relative z-10 bg-white">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to access your dashboard
            </p>
          </div>

          {(localError || error) && (
            <div className="mt-2 text-sm text-red-600 text-center bg-red-50 p-2 rounded">
              {localError || (typeof error === 'string' ? error : error?.message || 'An error occurred')}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative group">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 sm:text-sm bg-gray-50 focus:bg-white"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-purple-600 transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
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
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-purple-600 transition-colors duration-200">
              Sign up
            </Link>
          </p>
        </div>

        {/* Right Side: Image */}
        <div className="hidden md:block w-1/2 relative bg-gray-100">
          <img
            src="https://i.pinimg.com/1200x/0c/9b/89/0c9b89b62ba04b4b4740f4ce2da28b54.jpg"
            alt="Login Visual"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-purple-900 opacity-20"></div> {/* Optional overlay for text contrast if needed later */}
        </div>
      </div>
    </div>
  );
};

export default Login;