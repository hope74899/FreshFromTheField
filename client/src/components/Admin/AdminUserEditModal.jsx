/* eslint-disable react/prop-types */
// AdminUserEditModal.jsx
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import baseURL from '../../baseurl';
import { useAuth } from '../../auth/AuthToken';

const AdminUserEditModal = ({ isOpen, onClose, userIdToEdit }) => {
    const { token } = useAuth()
    const [user, setUser] = useState(null); // Stores the full user object fetched
    const [role, setRole] = useState('');
    const [isLoggin, setIsLoggin] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [profileComplete, setProfileComplete] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Available roles - should ideally match your backend schema enum
    const availableRoles = [
        { value: '', label: 'Select Role' }, // For a placeholder
        { value: 'farmer', label: 'Farmer' },
        { value: 'buyer', label: 'Buyer' },
        { value: 'transporter', label: 'Transporter' },
        { value: 'admin', label: 'Admin' },
    ];

    // Fetch user data when the modal opens or userIdToEdit changes
    const fetchUserData = useCallback(async () => {
        if (!userIdToEdit) {
            setUser(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage('');
        try {
            const response = await axios.get(`${baseURL}/api/user/getbyid/${userIdToEdit}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
            if (response.status === 200) {
                const data = response.data.user;
                setUser(data);
                setRole(data.role);
                setIsLoggin(data.isLoggin || false);
                setIsVerified(data.isVerified || false);
                setProfileComplete(data.profileComplete || false);
            }

        } catch (err) {
            console.error("Fetch user error:", err);
            setError(err.response?.data?.message || err.message);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [userIdToEdit]);


    useEffect(() => {
        if (isOpen) {
            fetchUserData();
        } else {
            // Reset form when modal is closed
            setUser(null);
            setRole('');
            setIsLoggin(false);
            setIsVerified(false);
            setProfileComplete(false);
            setError(null);
            setSuccessMessage('');
        }
    }, [isOpen, fetchUserData]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userIdToEdit) {
            setError("No user selected for update.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage('');

        const payload = {
            role: role === 'null_string_representation' || role === '' ? null : role,
            isLoggin,
            isVerified,
            profileComplete
        };

        try {
            const response = await axios.put(`${baseURL}/api/user/updatebyadmin/${userIdToEdit}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const responseData = response.data;
            setSuccessMessage(responseData.message || 'User updated successfully!');
            if (responseData.user) {
                setUser(prevUser => ({ ...prevUser, ...responseData.user }));
                setRole(responseData.user.role === null ? 'null_string_representation' : (responseData.user.role || ''));
                setIsLoggin(responseData.user.isLoggin || false);
                setIsVerified(responseData.user.isVerified || false);
                setProfileComplete(responseData.user.profileComplete || false);
            }
        } catch (err) {
            console.error("Update user error:", err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };


    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 top-0 bg-black/50 flex justify-center items-start pt-10 sm:pt-16 z-50 overflow-y-auto p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md my-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Edit User Status</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {isLoading && !user && <p>Loading user data...</p>}
                {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-3">{error}</p>}
                {successMessage && <p className="text-green-500 bg-green-100 p-3 rounded mb-3">{successMessage}</p>}

                {user && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <p className="text-sm text-gray-600">User: <span className="font-medium">{user.firstName} {user.lastName} ({user.email})</span></p>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                id="role"
                                value={role === null ? 'null_string_representation' : role} // Handle null correctly for select
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={isLoading}
                            >
                                {availableRoles.map(r => (
                                    <option key={r.value === null ? 'null_key' : r.value} value={r.value === null ? 'null_string_representation' : r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isLoggin}
                                    onChange={(e) => setIsLoggin(e.target.checked)}
                                    className="form-checkbox h-5 w-5 text-indigo-600"
                                    disabled={isLoading}
                                />
                                <span className="ml-2 text-sm text-gray-700">Is Logged In</span>
                            </label>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isVerified}
                                    onChange={(e) => setIsVerified(e.target.checked)}
                                    className="form-checkbox h-5 w-5 text-indigo-600"
                                    disabled={isLoading}
                                />
                                <span className="ml-2 text-sm text-gray-700">Is Verified</span>
                            </label>
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={profileComplete}
                                    onChange={(e) => setProfileComplete(e.target.checked)}
                                    className="form-checkbox h-5 w-5 text-indigo-600"
                                    disabled={isLoading}
                                />
                                <span className="ml-2 text-sm text-gray-700">Profile Complete</span>
                            </label>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
                {!isLoading && !user && userIdToEdit && !error && (
                    <p>Could not load user data. User may not exist or an error occurred.</p>
                )}
            </div>
        </div>
    );
};

export default AdminUserEditModal;