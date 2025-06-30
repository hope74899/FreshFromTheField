import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import baseURL from '../../baseurl';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the toastify CSS

const OTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // Get email from the previous route
  const fromSignup = location.state?.fromSignup; // Flag to check if from signup
  const fromForgotPassword = location.state?.fromForgotPassword; // Flag to check if from forgot password

  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);

  const navigateToOTP = (email) => {
    navigate('/update-password', { state: { email } });
  };

  // Handle OTP input change
  const onOTPChange = (e) => {
    setOtpInput(e.target.value);
  };

  // Handle OTP submission using Axios
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Make API request to verify OTP using Axios
      const response = await axios.post(`${baseURL}/api/otp-verify`, {
        email,      // Sending email from location
        otp: otpInput,  // OTP entered by the user
      }, {
        headers: {
          'Content-Type': 'application/json', // Ensure API expects JSON format
        }
      });
      if (response.status === 200 && fromSignup) {
        // OTP verified successfully
        toast.success(response.data.message);
        setLoading(false);
        navigate('/login'); // Navigate to login page after success
      }
      else if (response.status === 200 && fromForgotPassword) {

        // OTP verified successfully
        toast.success(response.data.message);
        setLoading(false);
        navigateToOTP(email)
      }
      else {
        // Error in OTP verification
        toast.error(response.data.message || 'OTP Verification Failed');
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await axios.post(`${baseURL}/api/resendotp`, { email }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 200) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {loading ? (
        <div className="loading-container mx-auto my-20">
          <div className="outer-circle"></div>
          <div className="inner-circle"></div>
          <div className="loading-text">Loading...</div>
        </div>
      ) : (
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-gray-800">OTP Verification</h2>
          <p className="text-center text-gray-600 mt-2">Enter the OTP sent to your email</p>
          <form className="mt-4" onSubmit={handleOTPSubmit}>
            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                OTP
              </label>
              <input
                className="block w-full mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                type="text"
                name="otp"
                value={otpInput}
                id="otp"
                placeholder="Enter OTP"
                onChange={onOTPChange}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
          <p className="text-center mt-4">
            Didn&apos;t receive an OTP?{' '}
            <button
              type="button"
              className="text-blue-500 underline focus:outline-none"
              onClick={handleResendOTP}
            >
              Resend OTP
            </button>
          </p>
        </div>
      )}
    </div>

  );
};

// eslint-disable-next-line react-refresh/only-export-components
export default OTP;
