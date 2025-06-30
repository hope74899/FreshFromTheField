/* eslint-disable react/prop-types */
import { useState } from 'react';
import axios from 'axios';
import baseURL from '../../baseurl'; // Adjust path
import { useAuth } from '../../auth/AuthToken'; // Adjust path
import LoadingSpinner from '../Common/LoadingSpinner'; // Adjust path
import { FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const UpdateVerificationModal = ({ isOpen, onClose, user, onStatusUpdated }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const handleUpdate = async (newStatus) => {
        if (!user) return;
        setIsUpdating(true);
        setError(null);
        try {
            // *** ADJUST API ENDPOINT AS NEEDED ***
            // Common patterns: PATCH /api/admin/users/{userId} with { isVerified: newStatus }
            // Or PUT /api/admin/users/{userId}/verify with { status: newStatus }
            await axios.patch(`${baseURL}/api/admin/users/${user._id}`,
                { isVerified: newStatus }, // Send the new status in the request body
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            onStatusUpdated(user._id, newStatus); // Notify parent component
            onClose(); // Close modal on success
        } catch (err) {
            console.error("Error updating verification status:", err);
            setError(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Update Verification Status</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-700">
                        User: <span className="font-medium">{user.firstName} {user.lastName}</span> ({user.email})
                    </p>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Current Status:</span>
                        {user.isVerified ? (
                            <span className="flex items-center text-green-600 font-medium"><FaCheckCircle className="mr-1" /> Verified</span>
                        ) : (
                            <span className="flex items-center text-red-600 font-medium"><FaTimesCircle className="mr-1" /> Not Verified</span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <p className="text-sm text-gray-700 pt-2">Set status to:</p>
                    <div className="flex justify-center space-x-4 pt-2">
                        <button
                            onClick={() => handleUpdate(true)}
                            disabled={isUpdating || user.isVerified} // Disable if already verified or updating
                            className={`px-4 py-2 rounded font-medium text-white flex items-center justify-center space-x-1 focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out ${user.isVerified || isUpdating ? 'bg-green-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                                }`}
                        >
                            {isUpdating ? <LoadingSpinner size="small" color="white" /> : <FaCheckCircle />}
                            <span>Verify</span>
                        </button>
                        <button
                            onClick={() => handleUpdate(false)}
                            disabled={isUpdating || !user.isVerified} // Disable if already not verified or updating
                            className={`px-4 py-2 rounded font-medium text-white flex items-center justify-center space-x-1 focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out ${!user.isVerified || isUpdating ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
                                }`}
                        >
                            {isUpdating ? <LoadingSpinner size="small" color="white" /> : <FaTimesCircle />}
                            <span>Un-verify</span>
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className="text-center text-red-600 text-sm mt-3">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateVerificationModal;