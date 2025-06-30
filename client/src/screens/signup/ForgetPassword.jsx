import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../baseurl';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const navigateToOTP = (email) => {
    navigate('/otp', { state: { email, fromForgotPassword: true } });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${baseURL}/api/forgot-password`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      toast.success('Enter OTP sent to your email');
      setTimeout(() => {
        navigateToOTP(email);
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.details || error.response.data.message);
      } else {
        toast.error('An error occurred. Please try again.');
      }
      console.log('Client-side forgot password error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Forgot Password</h2>
        <p className="text-center text-gray-600 mt-2">
          Enter your registered email to reset your password
        </p>
        <form className="mt-4" onSubmit={handleForgotPassword}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="block w-full mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={!email || loading}
          >
            {loading ? 'Processing...' : 'Search Email'}
          </button>
        </form>
        <p className="text-center mt-4">
          Remembered your password?{' '}
          <button
            className="text-blue-500 underline focus:outline-none"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
