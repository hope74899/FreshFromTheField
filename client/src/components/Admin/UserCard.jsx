/* eslint-disable react/prop-types */

import { FaEdit, FaTrashAlt, FaEye, FaCheckCircle, FaTimesCircle, FaUserCircle, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { imageurl } from '../../baseurl'; // Adjust path if needed

const UserCard = ({ user, onUpdateVerification, onUpdateUser, onDeleteUser, onViewProducts, handleViewVehicles }) => {

    const getRoleStyle = (role) => {
        // Role styles remain the same
        switch (role?.toLowerCase()) { // Added safety toLowerCase()
            case 'admin': return 'bg-red-100 text-red-800 border-red-300';
            case 'farmer': return 'bg-green-100 text-green-800 border-green-300';
            case 'transporter': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'buyer': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    // Profile image URL logic remains the same
    const profileImageUrl = user.profileImage
        ? (user.profileImage.startsWith('http') ? user.profileImage : `${imageurl}/${user.profileImage}`)
        : null;

    return (
        <div className="bg-white rounded-md shadow border border-gray-200 overflow-hidden transition-shadow duration-150 hover:shadow-md flex flex-col text-sm"> {/* Reduced rounding, shadow, base text size */}
            {/* Card Header - Reduced padding, image size, text size, spacing */}
            <div className="p-2.5 flex items-center space-x-2 border-b border-gray-100"> {/* Reduced padding & spacing */}
                {profileImageUrl ? (
                    <img className="h-10 w-10 rounded-full object-cover flex-shrink-0" src={profileImageUrl} alt={`${user.firstName}'s profile`} /> /* Smaller image */
                ) : (
                    <FaUserCircle className="h-10 w-10 text-gray-400 flex-shrink-0" /> /* Smaller icon */
                )}
                <div className="flex-grow min-w-0">
                    {/* Smaller name font size */}
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.firstName} {user.lastName}</p>
                    {/* Email and Farm Name remain text-xs */}
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    {user.role === 'farmer' && user.farmerDetails?.farmName && (
                        <p className="text-xs text-green-600 font-medium truncate">{user.farmerDetails.farmName}</p>
                    )}
                </div>
                {/* Role Badge remains text-xs, padding adjusted slightly if needed */}
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${getRoleStyle(user.role)} self-start whitespace-nowrap`}> {/* Slightly reduced padding */}
                    {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'} {/* Added safety check */}
                </span>
            </div>

            {/* Card Body - Reduced padding, text size, spacing */}
            <div className="p-2.5 text-xs text-gray-600 space-y-1.5 flex-grow"> {/* Reduced padding, base text, spacing */}
                {/* Location and Joined now text-xs */}
                <p><strong className="font-medium text-gray-700">Location:</strong> {user.city || user.province ? `${user.city || ''}${user.city && user.province ? ', ' : ''}${user.province || ''}` : 'N/A'}</p> {/* Slightly improved formatting */}
                <p><strong className="font-medium text-gray-700">Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                <div className="flex items-center space-x-1.5 pt-1"> {/* Reduced spacing, added slight top padding */}
                    <strong className="font-medium text-gray-700">Status:</strong>
                    {user.isVerified ? (
                        <span className="flex items-center text-green-600"><FaCheckCircle className="mr-0.5 h-3.5 w-3.5" /> Verified</span> /* Smaller icon */
                    ) : (
                        <span className="flex items-center text-red-600"><FaTimesCircle className="mr-0.5 h-3.5 w-3.5" /> Not Verified</span> /* Smaller icon */
                    )}
                    {/* Toggle Button - Smaller size */}
                    <button
                        onClick={() => onUpdateVerification(user)}
                        className={`p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-offset-1 ml-auto ${user.isVerified ? 'text-green-500 hover:text-green-700 focus:ring-green-400' : 'text-gray-400 hover:text-gray-600 focus:ring-gray-400'}`} // Changed unverified color
                        title={user.isVerified ? "Mark as Not Verified" : "Mark as Verified"}
                        aria-label={user.isVerified ? "Mark as Not Verified" : "Mark as Verified"}
                    >
                        {user.isVerified ? <FaToggleOn className="h-5 w-5" /> : <FaToggleOff className="h-5 w-5" />} {/* Smaller toggle */}
                    </button>
                </div>
            </div>

            {/* Card Footer - Reduced padding, spacing, icon size */}
            <div className="p-2 bg-gray-50 border-t border-gray-100 flex justify-end items-center space-x-1.5"> {/* Reduced padding & spacing */}
                {/* Action Buttons - Smaller Icons */}
                {user.role === 'farmer' && (
                    <button
                        onClick={() => onViewProducts(user._id, `${user.firstName} ${user.lastName}`)}
                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        title="View Farmer's Products"
                    >
                        <FaEye className="h-4 w-4" /> {/* Smaller icon */}
                    </button>
                )}
                {user.role === 'transporter' && (
                    <button
                        onClick={() => handleViewVehicles(user._id)}
                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        title="View Transporter's Vehicle"
                    >
                        <FaEye className="h-4 w-4" /> {/* Smaller icon */}
                    </button>
                )}
                <button
                    onClick={() => onUpdateUser(user._id)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    title="Edit User"
                >
                    <FaEdit className="h-4 w-4" /> {/* Smaller icon */}
                </button>
                <button
                    onClick={() => onDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                    className="text-red-600 hover:text-red-800 p-1 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                    title="Delete User"
                >
                    <FaTrashAlt className="h-4 w-4" /> {/* Smaller icon */}
                </button>
            </div>
        </div>
    );
};

export default UserCard;