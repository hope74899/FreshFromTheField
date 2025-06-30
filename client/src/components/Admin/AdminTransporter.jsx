import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import baseURL from '../../baseurl'; // Adjust path if needed
import { useAuth } from '../../auth/AuthToken'; // Adjust path if needed
import LoadingSpinner from '../Common/LoadingSpinner'; // Adjust path if needed
import UserCard from './UserCard'; // UserCard can display any user type
import UpdateVerificationModal from './UpdateVerificationModal'; // Import the modal
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminUserEditModal from './AdminUserEditModal';

const AdminTransporter = () => {
    // State to hold only transporters after filtering
    const [transporters, setTransporters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // This will be a transporter

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const { token } = useAuth();
    const navigate = useNavigate();

    // --- Fetch ALL Users and Filter for Transporters ---
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            setTransporters([]); // Clear previous transporters
            try {
                // Fetch ALL users from the existing endpoint
                const response = await axios.get(`${baseURL}/api/user/get`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Validate the response before processing
                if (response.status === 200 && Array.isArray(response.data)) {
                    const allUsersData = response.data;
                    // Filter for users with the 'transporter' role (case-insensitive recommended)
                    const filteredTransporters = allUsersData.filter(user =>
                        user && user.role && user.role.toLowerCase() === 'transporter' // Safe check
                    );
                    setTransporters(filteredTransporters); // Set state with only transporters
                } else if (response.status === 200 && !Array.isArray(response.data)) {
                    console.error("API did not return an array for users:", response.data);
                    throw new Error("Received invalid user data format from server.");
                } else {
                    throw new Error(`Failed to fetch users. Status: ${response.status}`);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch users.');
                setTransporters([]); // Ensure state is empty array on error
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchUsers();
        } else {
            setError("Authentication token not found.");
            setLoading(false);
        }
    }, [token]); // Re-fetch if token changes

    // --- Filtering based on Search Term (Operates on the 'transporters' state) ---
    const searchedTransporters = useMemo(() => {
        // Check the 'transporters' state array
        if (!Array.isArray(transporters)) return [];
        if (!searchTerm.trim()) {
            return transporters; // Return all transporters if no search term
        }
        const lowerCaseSearch = searchTerm.toLowerCase().trim();
        // Filter the 'transporters' array
        return transporters.filter(user => {
            // Adjust search fields if needed for transporters (e.g., company name?)
            const firstNameMatch = user.firstName && user.firstName.toLowerCase().includes(lowerCaseSearch);
            const lastNameMatch = user.lastName && user.lastName.toLowerCase().includes(lowerCaseSearch);
            const emailMatch = user.email && user.email.toLowerCase().includes(lowerCaseSearch);
            // Example: Add search for transporter-specific details if they exist
            // const companyNameMatch = user.transporterDetails?.companyName && user.transporterDetails.companyName.toLowerCase().includes(lowerCaseSearch);

            // Include the fields you want to search within for transporters
            return firstNameMatch || lastNameMatch || emailMatch; // || companyNameMatch;
        });
    }, [transporters, searchTerm]); // Depends on 'transporters' state and searchTerm

    // --- Action Handlers ---


    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete transporter "${userName}"? This cannot be undone.`)) {
            // console.log(`Attempting to delete transporter: ${userId}`);
            try {
                await axios.delete(`${baseURL}/api/admin/users/${userId}`, { // Use the correct user deletion endpoint
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Update state by removing the user from the 'transporters' list
                setTransporters(currentTransporters => currentTransporters.filter(transporter => transporter._id !== userId));
                alert(`Transporter ${userName} deleted successfully.`);
            } catch (err) {
                console.error("Error deleting transporter:", err);
                alert(err.response?.data?.message || 'Failed to delete transporter.');
            }
        }
    };

    // Note: handleViewProducts is likely irrelevant for transporters, so it's removed from UserCard props below.

    const handleViewVehicles = (transporterId) => {
        navigate(`/transporter/dashboard/transportervehicles/${transporterId}`)
    };
    // --- Modal Handlers ---
    const handleOpenVerificationModal = (user) => {
        setSelectedUser(user); // User will be a transporter
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleStatusUpdated = (userId, newStatus) => {
        // Update user in the 'transporters' list state
        setTransporters(currentTransporters =>
            currentTransporters.map(transporter =>
                transporter._id === userId ? { ...transporter, isVerified: newStatus } : transporter
            )
        );
        // Optionally: Show a success notification/toast
    };


    const handleUpdateUser = (userId) => {
        // Navigate to a generic user edit page or a specific transporter edit page
        toast.info(`Navigate to edit page for transporter ID: ${userId} (Not implemented)`);
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };


    const handleUpdateCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUserId(null); // Clear selected user on close
    };
    // --- Render Logic ---
    if (loading) return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><LoadingSpinner /></div>;
    if (error) return <div className="text-center text-red-600 font-semibold mt-10 p-4 bg-red-100 border border-red-300 rounded mx-auto max-w-lg">{error}</div>;

    // Use 'transporters' state to check if initial fetch returned any transporters
    const hasFetchedTransporters = transporters.length > 0;
    // Use 'searchedTransporters' to check the result after applying search
    const hasVisibleTransporters = searchedTransporters.length > 0;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
            {/* Update Title */}
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Manage Transporters</h1>

            {/* Search Bar */}
            <div className="mb-6 max-w-lg">
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400 h-5 w-5" />
                    </div>
                    <input
                        type="search"
                        // Update placeholder
                        placeholder="Search transporters by name, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Message Logic Updated - Use searchedTransporters length */}
            {!loading && !hasVisibleTransporters && (
                <p className="text-center text-gray-500 mt-10 text-lg">
                    {!hasFetchedTransporters && !searchTerm // Check if initial fetch was empty AND no search term
                        ? 'No transporters registered yet.'
                        : searchTerm
                            ? 'No transporters match your search criteria.'
                            : 'No transporters found.' // Fallback
                    }
                </p>
            )}

            {/* Display ONLY Transporter Cards Grid - Use searchedTransporters */}
            {hasVisibleTransporters && (
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {/* Map over searchedTransporters */}
                    {searchedTransporters.map(user => (
                        <UserCard
                            key={user._id || user.email}
                            user={user} // Pass the transporter user object
                            onUpdateVerification={handleOpenVerificationModal}
                            onUpdateUser={handleUpdateUser}
                            onDeleteUser={handleDeleteUser}
                            handleViewVehicles={handleViewVehicles}
                        />
                    ))}
                </div>
            )}
            <AdminUserEditModal
                isOpen={isModalOpen}
                onClose={handleUpdateCloseModal}
                userIdToEdit={selectedUserId}
            />

            {/* Verification Status Update Modal */}
            <UpdateVerificationModal
                isOpen={showModal}
                onClose={handleCloseModal}
                user={selectedUser} // Will be the selected transporter
                onStatusUpdated={handleStatusUpdated}
            />
        </div>
    );
};

export default AdminTransporter;