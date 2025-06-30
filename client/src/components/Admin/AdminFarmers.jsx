import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import baseURL from '../../baseurl'; // Adjust path if needed
import { useAuth } from '../../auth/AuthToken'; // Adjust path if needed
import LoadingSpinner from '../Common/LoadingSpinner'; // Adjust path if needed
import UserCard from './UserCard'; // UserCard can display any user, including farmers
import UpdateVerificationModal from './UpdateVerificationModal'; // Import the modal
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminUserEditModal from './AdminUserEditModal';

// Rename component for clarity (optional but recommended)
// const ViewUsers = () => { becomes:
const AdminFarmers = () => {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // This will be a farmer


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { token } = useAuth();
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        setFarmers([]); // Clear previous users
        try {
            // Fetch ALL users from the existing endpoint
            const response = await axios.get(`${baseURL}/api/user/get`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                // console.log('response.data', response.data)
                const data = response.data;
                const farmers = data.filter(user => user.role === 'farmer');
                setFarmers(farmers);
            } else {
                throw new Error(`Failed to fetch users. Status: ${response.status}`);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        } else {
            setError("Authentication token not found.");
            setLoading(false);
        }
    }, [token]); // Re-fetch if token changes

    // --- Filtering based on Search Term (Operates on ALL users first) ---
    const searchedFarmers = useMemo(() => {
        // Check the 'farmers' state array
        if (!Array.isArray(farmers)) return [];
        if (!searchTerm.trim()) {
            return farmers; // Return all farmers if no search term
        }
        const lowerCaseSearch = searchTerm.toLowerCase().trim();
        // Filter the 'farmers' array
        return farmers.filter(user => {
            const firstNameMatch = user.firstName && user.firstName.toLowerCase().includes(lowerCaseSearch);
            const lastNameMatch = user.lastName && user.lastName.toLowerCase().includes(lowerCaseSearch);
            const emailMatch = user.email && user.email.toLowerCase().includes(lowerCaseSearch);
            const farmNameMatch = user.farmerDetails?.farmName && user.farmerDetails.farmName.toLowerCase().includes(lowerCaseSearch);
            return firstNameMatch || lastNameMatch || emailMatch || farmNameMatch;
        });
    }, [farmers, searchTerm]); // Depends on 'farmers' state now

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete farmer "${userName}"? This cannot be undone.`)) {
            try {
                await axios.delete(`${baseURL}/api/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Update state by removing the user from the 'farmers' list
                setFarmers(currentFarmers => currentFarmers.filter(farmer => farmer._id !== userId));
                alert(`Farmer ${userName} deleted successfully.`);
            } catch (err) {
                console.error("Error deleting farmer:", err);
                alert(err.response?.data?.message || 'Failed to delete farmer.');
            }
        }
    };

    // This handler is specifically relevant for farmers
    const handleViewProducts = (farmerId) => {
        navigate(`/farmer/dashboard/farmerproducts/${farmerId}`)
    };

    // --- Modal Handlers (Remain the same) ---
    const handleOpenVerificationModal = (user) => {
        setSelectedUser(user); // User will be a farmer
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleStatusUpdated = (userId, newStatus) => {
        // Update user in the 'farmers' list state
        setFarmers(currentFarmers =>
            currentFarmers.map(farmer =>
                farmer._id === userId ? { ...farmer, isVerified: newStatus } : farmer
            )
        );
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

    const hasFetchedFarmers = farmers.length > 0;
    // Use 'searchedFarmers' to check the result after applying search
    const hasVisibleFarmers = searchedFarmers.length > 0;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Manage Farmers</h1>
            <div className="mb-6 max-w-lg">
                {/* Search Bar */}
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400 h-5 w-5" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search farmers by name, email, farm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Message Logic Updated - Use searchedFarmers length */}
            {!loading && !hasVisibleFarmers && (
                <p className="text-center text-gray-500 mt-10 text-lg">
                    {!hasFetchedFarmers && !searchTerm // Check if initial fetch was empty AND no search term
                        ? 'No farmers registered yet.'
                        : searchTerm
                            ? 'No farmers match your search criteria.'
                            : 'No farmers found.' // Should not happen if hasFetchedFarmers is true and searchTerm is empty, but safe fallback
                    }
                </p>
            )}

            {/* Display Farmer Cards Grid - Use searchedFarmers */}
            {hasVisibleFarmers && (
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {/* Map over searchedFarmers */}
                    {searchedFarmers.map(user => (
                        <UserCard
                            key={user._id || user.email}
                            user={user}
                            onUpdateVerification={handleOpenVerificationModal}
                            onUpdateUser={handleUpdateUser}
                            onDeleteUser={handleDeleteUser}
                            onViewProducts={handleViewProducts}
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
                user={selectedUser}
                onStatusUpdated={handleStatusUpdated}
            />
        </div>
    );
};

// Make sure to export with the potentially new name
// export default ViewUsers; becomes:
export default AdminFarmers; // Export the renamed component