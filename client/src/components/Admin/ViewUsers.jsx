import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import baseURL from '../../baseurl'; // Adjust path if needed
import { useAuth } from '../../auth/AuthToken'; // Adjust path if needed
import LoadingSpinner from '../Common/LoadingSpinner'; // Adjust path if needed
import UserCard from './UserCard'; // UserCard can display any user
import UpdateVerificationModal from './UpdateVerificationModal'; // Import the modal
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminUserEditModal from './AdminUserEditModal';

const ViewUsers = () => {
    // State to hold ALL users initially fetched from API
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const { token } = useAuth();
    const navigate = useNavigate();

    // --- Fetch ALL Users ---
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            setAllUsers([]); // Clear previous users
            try {
                const response = await axios.get(`${baseURL}/api/user/get`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.status === 200 && Array.isArray(response.data)) {
                    setAllUsers(response.data); // Store all fetched users
                } else if (response.status === 200 && !Array.isArray(response.data)) {
                    console.error("API did not return an array for users:", response.data);
                    setError("Received invalid user data format from server.");
                    setAllUsers([]);
                } else {
                    throw new Error(`Failed to fetch users. Status: ${response.status}`);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch users.');
                setAllUsers([]); // Ensure state is empty on error
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

    // --- 1. Apply Search Term to ALL users ---
    const searchedUsers = useMemo(() => {
        if (!Array.isArray(allUsers)) return [];
        if (!searchTerm.trim()) {
            return allUsers; // Return all if no search term
        }
        const lowerCaseSearch = searchTerm.toLowerCase().trim();
        return allUsers.filter(user => {
            // Add relevant fields for searching admins/buyers if needed
            const firstNameMatch = user.firstName && user.firstName.toLowerCase().includes(lowerCaseSearch);
            const lastNameMatch = user.lastName && user.lastName.toLowerCase().includes(lowerCaseSearch);
            const emailMatch = user.email && user.email.toLowerCase().includes(lowerCaseSearch);
            // farmNameMatch might not be relevant here unless buyers/admins have it
            // const farmNameMatch = user.farmerDetails?.farmName && user.farmerDetails.farmName.toLowerCase().includes(lowerCaseSearch);

            return firstNameMatch || lastNameMatch || emailMatch; // || farmNameMatch;
        });
    }, [allUsers, searchTerm]);

    // --- 2. Filter OUT Farmers and Transporters ---
    const displayableUsers = useMemo(() => {
        // Filter the list obtained after searching
        return searchedUsers.filter(user => {
            const role = user?.role?.toLowerCase(); // Safe access and lowercasing
            // Keep users whose role is NOT 'farmer' AND NOT 'transporter'
            return role !== 'farmer' && role !== 'transporter';
        });
    }, [searchedUsers]); // Depends on the result of the search

    // --- 3. Categorize the Remaining Users (Admins, Buyers, Other) ---
    const categorizedUsers = useMemo(() => {
        // Operate on the list that excludes farmers/transporters
        if (!Array.isArray(displayableUsers)) return {};

        // Define categories we want to display
        const categories = {
            admin: [],
            buyer: [], // Assuming 'buyer' is the role name
            other: []  // For any unexpected roles that aren't farmer/transporter
        };

        displayableUsers.forEach(user => {
            if (user && user.role && typeof user.role === 'string') {
                const role = user.role.toLowerCase();
                if (categories.hasOwnProperty(role)) {
                    categories[role].push(user);
                } else {
                    // This user is not farmer, transporter, admin, or buyer
                    console.warn(`Unknown user role encountered (displaying): "${user.role}". Placing in 'other'.`);
                    categories.other.push(user);
                }
            } else {
                // User missing role, but not farmer/transporter (already filtered)
                console.warn(`User has missing/invalid role (displaying). Placing in 'other'.`, user);
                if (user) {
                    categories.other.push(user);
                }
            }
        });

        // Filter out empty categories before returning
        const populatedCategories = {};
        Object.entries(categories).forEach(([role, usersInCategory]) => {
            if (usersInCategory.length > 0) {
                populatedCategories[role] = usersInCategory;
            }
        });

        return populatedCategories;

    }, [displayableUsers]); // Depends on the list excluding farmers/transporters

    // --- Action Handlers ---
    const handleUpdateUser = (userId) => {
        // Navigate to a generic user edit page or a specific transporter edit page
        toast.info(`Navigate to edit page for transporter ID: ${userId} (Not implemented)`);
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };

    const handleDeleteUser = async (userId, userName) => {
        // Use appropriate confirmation message
        if (window.confirm(`Are you sure you want to delete user "${userName}"? This cannot be undone.`)) {
            // console.log(`Attempting to delete user: ${userId}`);
            try {
                await axios.delete(`${baseURL}/api/admin/users/${userId}`, { // Use correct endpoint
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Update the *original* list state
                setAllUsers(currentUsers => currentUsers.filter(user => user._id !== userId));
                alert(`User ${userName} deleted successfully.`);
                // displayableUsers and categorizedUsers will update automatically via useMemo
            } catch (err) {
                console.error("Error deleting user:", err);
                alert(err.response?.data?.message || 'Failed to delete user.');
            }
        }
    };

    // handleViewProducts is removed from UserCard props below as it's irrelevant

    // --- Modal Handlers ---
    const handleOpenVerificationModal = (user) => {
        setSelectedUser(user); // User will be admin, buyer, or other
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleUpdateCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUserId(null); // Clear selected user on close
    };

    const handleStatusUpdated = (userId, newStatus) => {
        // Update user in the *original* list state
        setAllUsers(currentUsers =>
            currentUsers.map(u =>
                u._id === userId ? { ...u, isVerified: newStatus } : u
            )
        );
        // displayableUsers and categorizedUsers will update automatically
    };

    // --- Render Logic ---
    if (loading) return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><LoadingSpinner /></div>;
    if (error) return <div className="text-center text-red-600 font-semibold mt-10 p-4 bg-red-100 border border-red-300 rounded mx-auto max-w-lg">{error}</div>;

    // Check based on displayable users (after excluding farmer/transporter & applying search)
    const hasRelevantUsers = displayableUsers.length > 0;
    // Check if anything was fetched initially
    const hasFetchedAnyUsers = allUsers.length > 0;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
            {/* Update Title if desired */}
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Manage Users (Admins & Buyers)</h1>

            {/* Search Bar */}
            <div className="mb-6 max-w-lg">
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400 h-5 w-5" />
                    </div>
                    <input
                        type="search"
                        // Update placeholder
                        placeholder="Search admins or buyers by name, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Message Logic Updated */}
            {!loading && !hasRelevantUsers && (
                <p className="text-center text-gray-500 mt-10 text-lg">
                    {!hasFetchedAnyUsers // Check if initial fetch was empty
                        ? 'No users found in the system.'
                        : searchTerm
                            ? 'No matching admins or buyers found.' // Message when search yields no relevant users
                            : 'No admins or buyers found in the system.' // Fetched users, but none were admin/buyer
                    }
                </p>
            )}

            {/* Explicit Rendering Order: Admins -> Buyers -> Other */}
            {hasRelevantUsers && (
                <>
                    {/* Render Admins First if they exist */}
                    {categorizedUsers.admin && categorizedUsers.admin.length > 0 && (
                        <section key="admin-section" className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize border-b border-gray-300 pb-2">
                                Admins ({categorizedUsers.admin.length})
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {categorizedUsers.admin.map(user => (
                                    <UserCard
                                        key={user._id || user.email}
                                        user={user}
                                        onUpdateVerification={handleOpenVerificationModal}
                                        onUpdateUser={handleUpdateUser}
                                        onDeleteUser={handleDeleteUser}
                                    // onViewProducts removed
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Render Buyers Next if they exist */}
                    {categorizedUsers.buyer && categorizedUsers.buyer.length > 0 && (
                        <section key="buyer-section" className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize border-b border-gray-300 pb-2">
                                Buyers ({categorizedUsers.buyer.length}) {/* Or maybe just "Users"? */}
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {categorizedUsers.buyer.map(user => (
                                    <UserCard
                                        key={user._id || user.email}
                                        user={user}
                                        onUpdateVerification={handleOpenVerificationModal}
                                        onUpdateUser={handleUpdateUser}
                                        onDeleteUser={handleDeleteUser}
                                    // onViewProducts removed
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Render Other users Last if they exist */}
                    {categorizedUsers.other && categorizedUsers.other.length > 0 && (
                        <section key="other-section" className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize border-b border-gray-300 pb-2">
                                Other Roles ({categorizedUsers.other.length})
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {categorizedUsers.other.map(user => (
                                    <UserCard
                                        key={user._id || user.email}
                                        user={user}
                                        onUpdateVerification={handleOpenVerificationModal}
                                        onUpdateUser={handleUpdateUser}
                                        onDeleteUser={handleDeleteUser}
                                    // onViewProducts removed
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </>
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
                user={selectedUser} // Could be admin, buyer, or other
                onStatusUpdated={handleStatusUpdated}
            />
        </div>
    );
};

export default ViewUsers;