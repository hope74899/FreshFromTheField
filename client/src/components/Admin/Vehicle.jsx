/* eslint-disable react/prop-types */

import { useAuth } from "../../auth/AuthToken";
import baseURL, { imageurl } from "../../baseurl";
import { FaMapMarkerAlt } from "react-icons/fa";
import UpdateVehicleModal from "./UpdateVehicleModal";
import { useState } from "react";
import axios from "axios";

const Vehicle = ({ vehicle, onVehicleDelete }) => {
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
                if (onVehicleDelete) {
                    onVehicleDelete();
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
                src={vehicle.images?.[0]?.filename ? `${imageurl}${vehicle.images[0].filename}` : '/defaultVehicle.png'}
                alt={vehicle.vehicleType}
                className="w-full h-40 object-cover object-center"
            />

            {/* Vehicle Details */}
            <div className="p-3 flex flex-col">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 font-serif">
                        {vehicle.vehicleType}
                    </h3>
                    <div className="flex items-center space-x-1">
                        <span className="text-gray-800 font-semibold">{vehicle.vehicleCapacity}</span>
                        <span className="text-gray-500 text-xs">kg</span>
                    </div>
                </div>

                {/* Registration Number */}
                <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                    License Plate: {vehicle.registrationNumber}
                </p>

                {/* Transporter Details */}
                {vehicle.transporter && (
                    <div className="px-2 py-1 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                            <img
                                src={vehicle.transporter.profileImage
                                    ? `${imageurl}${vehicle.transporter.profileImage}`
                                    : '/blankProfile.png'}
                                alt={vehicle.transporter.firstName}
                                className="w-6 h-6 rounded-full object-cover"
                            />
                            <div>
                                <p className="text-gray-800 text-xs font-medium">
                                    {vehicle.transporter.firstName} {vehicle.transporter.lastName}
                                </p>
                                {vehicle.transporter.transporterDetails?.location && (
                                    <p className="text-stone-600 text-xs flex items-center gap-1">
                                        <FaMapMarkerAlt className="inline-block mr-1 text-yellow-400" />
                                        {vehicle.transporter.transporterDetails.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Availability & Role-Based Best Vehicle Status */}
                <div className="flex flex-wrap items-center justify-between pt-2">
                    <p
                        className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${vehicle.available ? "bg-green-600 text-white" : "bg-red-600 text-white"
                            }`}
                    >
                        {vehicle.availability ? "Available" : "Not Available"}
                    </p>

                    {role === "admin" && (
                        <p
                            className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${vehicle.bestVehicle ? "bg-blue-600 text-white" : "bg-gray-500 text-white"
                                }`}
                        >
                            {vehicle.bestVehicle ? "Best Vehicle" : "Standard"}
                        </p>
                    )}
                </div>
            </div>

            {/* Buttons */}
            {role?.toLowerCase() === "admin" && (
                <div className="p-3 flex items-center justify-between border-t border-gray-200">
                    <button
                        onClick={handleUpdate}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md transition duration-200 text-sm"
                        disabled={isDeleting}
                    >
                        Update
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md transition duration-200 text-sm"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            )}

            {isModalOpen && (
                <UpdateVehicleModal
                    vehicle={vehicle}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {deleteError && (
                <div className="p-3 text-red-700 text-sm border-t border-gray-200">
                    {deleteError}
                </div>
            )}
        </div>
    );
};

export default Vehicle;