import { useState } from 'react';
import { useAuth } from '../../auth/AuthToken';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import baseURL from '../../baseurl';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { storeToken, setIsLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Make Axios request with credentials included
      const response = await axios.post(
        `${baseURL}/api/user/login`,
        { email, password }, // Request body
        {
          headers: {
            'Content-Type': 'application/json', // Set the Content-Type header
          },
          withCredentials: true, // Include cookies in the request
        }
      );

      if (response.status === 200) {
        storeToken(response.data); // Store token in context/state
        toast.success(response.data.message);

        if (response.data.user.role) {
          navigate('/');
        }
        else if (!response.data.user.role) {
          navigate('/profile')
        }
        else {
          navigate('/login');
        }

      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-200">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center text-gray-800">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mt-1">
          Log in to continue to your account
        </p>
        {error && (
          <p className="text-red-500 text-center mt-2 font-medium">{error}</p>
        )}
        <form className="mt-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                id="email"
                className="block w-full pl-10 mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                id="password"
                className="block w-full pl-10 mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-2 text-right">
              <Link
                to="/forget-password"
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 text-white bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Google Login Button */}
        <div className="mt-4">
          <button
            onClick={() => (window.location.href = `${baseURL}/api/google`)}
            className="w-full py-3 text-white bg-red-500 rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
          >
            Login with Google
          </button>
        </div>

        {/* Footer Links */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>

  );
};

export default Login;
