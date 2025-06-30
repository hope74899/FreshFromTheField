/* eslint-disable react/prop-types */
import { useAuth } from "../../auth/AuthToken";
import baseURL, { imageurl } from "../../baseurl";
import { FaWeightHanging } from "react-icons/fa";
import UpdateVehicleModal from "./UpdateVehicleModal";
import { useState } from "react";
import axios from "axios";

const VehicleCard = ({ vehicle, onVehicleDelete }) => {
    const { role, token } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const handleUpdate = () => {
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (
            !window.confirm(
                `Are you sure you want to delete the vehicle "${vehicle.vehicleType}"? This action cannot be undone.`
            )
        ) {
            return;
        }

        if (!token) {
            setDeleteError("Authentication token is missing. Cannot delete.");
            console.error("Delete Error: Token missing");
            return;
        }
        if (!vehicle?._id) {
            setDeleteError("Vehicle ID is missing. Cannot delete.");
            console.error("Delete Error: Vehicle ID missing");
            return;
        }

        setIsDeleting(true);
        setDeleteError(null);

        try {
            // Removed extra spaces from the URL string literal
            const response = await axios.delete(
                `${baseURL}/api/vehicle/delete/${vehicle._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                alert(`Vehicle "${vehicle.vehicleType}" deleted successfully!`);
                console.log("Type of onVehicleDelete prop:", typeof onVehicleDelete);
                if (onVehicleDelete) {
                    onVehicleDelete(); // Call the callback passed from parent
                }
            } else {
                setDeleteError(
                    response.data?.message ||
                    `Failed to delete vehicle. Status: ${response.status}`
                );
            }
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            setDeleteError(
                error.response?.data?.message ||
                error.message ||
                "An error occurred while deleting the vehicle."
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-100 flex flex-col">
            {/* Vehicle Image */}
            <img
                // Assuming imageurl already includes the base part if needed
                src={`${imageurl}${vehicle.images[0]?.filename}`}
                alt={vehicle.vehicleType}
                className="w-full h-40 object-cover object-center"
            />

            {/* Vehicle Details */}
            <div className="p-3 flex flex-col flex-grow"> {/* Added flex-grow */}
                <div className="flex items-center justify-between mb-1"> {/* Added mb-1 */}
                    <h3 className="text-lg font-semibold text-gray-800 font-serif truncate mr-2"> {/* Added truncate and mr-2 */}
                        {vehicle.vehicleType}
                    </h3>
                    <div className="flex items-center space-x-1 flex-shrink-0"> {/* Added flex-shrink-0 */}
                        <FaWeightHanging className="text-gray-500" />
                        <span className="text-gray-800 font-semibold">{vehicle.vehicleCapacity}</span>
                        <span className="text-gray-500 text-xs">KG</span>
                    </div>
                </div>

                {/* Registration Number */}
                <p className="text-gray-700 text-sm line-clamp-1 mb-2"> {/* Changed to line-clamp-1 and added mb-2 */}
                    Reg: {vehicle.registrationNumber}
                </p>

                {/* Availability & Role-Based Approved Status */}
                <div className="flex flex-wrap items-center gap-2 mt-auto"> {/* Added mt-auto */}
                    <p
                        className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${vehicle.availability
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                            }`}
                    >
                        {vehicle.availability ? "Available" : "Not Available"}
                    </p>

                    {role === "admin" && (
                        <p
                            className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${vehicle.approved
                                ? "bg-blue-600 text-white"
                                : "bg-gray-500 text-white"
                                }`}
                        >
                            {vehicle.approved ? "Approved" : "Pending"}
                        </p>
                    )}
                </div>
            </div>

            {/* Buttons */}
            <div className="p-3 flex items-center justify-between border-t border-gray-200">
                <button
                    onClick={handleUpdate}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md transition duration-200 text-sm disabled:opacity-50" // Added disabled style
                    disabled={isDeleting}
                >
                    Update
                </button>
                <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md transition duration-200 text-sm disabled:opacity-50" // Added disabled style
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Delete"}
                </button>
            </div>

            {/* Error Message */}
            {deleteError && (
                <div className="p-3 text-red-600 text-sm bg-red-50 border-t border-red-200">
                    {deleteError}
                </div>
            )}

            {/* Update Modal */}
            {isModalOpen && (
                <UpdateVehicleModal
                    vehicle={vehicle}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                // You might need to pass an onUpdate callback here too
                // onVehicleUpdated={handleVehicleUpdate} // Example
                />
            )}
        </div>
    );
};

export default VehicleCard;