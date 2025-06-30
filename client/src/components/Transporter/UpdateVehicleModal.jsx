/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import baseURL, { imageurl } from "../../baseurl";
import { useAuth } from "../../auth/AuthToken";
import axios from "axios";
import { FaTrash, FaEdit } from 'react-icons/fa';

const UpdateVehicleModal = ({ vehicle, isOpen, onClose, onVehicleUpdated }) => {
    const { role, token } = useAuth();
    const [isDeletingImage, setIsDeletingImage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize formData with vehicle fields
    const [formData, setFormData] = useState({
        vehicleType: vehicle.vehicleType || '',
        vehicleCapacity: vehicle.vehicleCapacity || 0,
        registrationNumber: vehicle.registrationNumber || '',
        availability: vehicle.availability !== undefined ? vehicle.availability : true,
        approved: vehicle.approved !== undefined ? vehicle.approved : false,
        images: (vehicle.images || []).map(img => ({
            ...img,
            // Removed space after filename
            preview: `${imageurl}${img.filename}`
        }))
    });

    const replaceImageInputRef = useRef(null);
    const [replaceImageIndex, setReplaceImageIndex] = useState(null);

    // Handle input changes for text/number fields
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Image handling functions
    const handleReplaceImageChange = (e) => {
        const file = e.target.files[0];
        if (!file || replaceImageIndex === null) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => {
                const updatedImages = [...prev.images];
                updatedImages[replaceImageIndex] = {
                    file: file,
                    preview: reader.result
                };
                return { ...prev, images: updatedImages };
            });
            setReplaceImageIndex(null);
        };
        reader.readAsDataURL(file);
        e.target.value = null;
    };

    const triggerReplaceImage = (index) => {
        setReplaceImageIndex(index);
        replaceImageInputRef.current?.click();
    };

    const handleAddImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (formData.images.length + files.length > 4) {
            alert("You can only upload up to 4 images.");
            return;
        }

        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
        e.target.value = null;
    };

    const handleRemoveImage = async (indexToRemove) => {
        const imageToRemove = formData.images[indexToRemove];
        if (imageToRemove.file && !imageToRemove.filename) {
            setFormData((prev) => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== indexToRemove),
            }));
            if (imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
                URL.revokeObjectURL(imageToRemove.preview);
            }
            return;
        }

        if (!imageToRemove.key) {
            console.error("Cannot delete image: Missing 'key' property.", imageToRemove);
            alert("Error: Cannot identify image to delete. Missing key.");
            return;
        }
        // Removed space before question mark in confirm message
        if (!window.confirm(`Are you sure you want to permanently delete this image(${imageToRemove.filename})?`)) {
            return;
        }

        setIsDeletingImage(true);
        try {
            // Removed spaces in URL
            const response = await axios.patch(
                `${baseURL}/api/vehicle/delete-image/${vehicle._id}`,
                { imageKey: imageToRemove.key },
                {
                    // Removed space after token
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200) {
                alert("Image deleted successfully!");
                setFormData((prev) => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== indexToRemove),
                }));
                if (onVehicleUpdated) {
                    onVehicleUpdated(response.data.vehicle);
                }
            } else {
                alert(response.data?.message || "Failed to delete image from server.");
            }
        } catch (error) {
            console.error("Error deleting image:", error);
            // Removed space before period in alert message
            alert(`Failed to delete image.${error.response?.data?.message || error.message}`);
        } finally {
            setIsDeletingImage(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const updatedVehicleData = new FormData();

        // Append vehicle fields
        updatedVehicleData.append("vehicleType", formData.vehicleType);
        updatedVehicleData.append("vehicleCapacity", formData.vehicleCapacity);
        updatedVehicleData.append("registrationNumber", formData.registrationNumber);
        updatedVehicleData.append("availability", String(formData.availability));

        if (role === "admin") {
            updatedVehicleData.append("approved", String(formData.approved));
        }

        // Append image files
        let imageCounter = 0;
        formData.images.forEach((img, index) => {
            if (img.file) {
                imageCounter++;
                // Removed space after index in key
                const imageKey = `image${index + 1}`;
                updatedVehicleData.append(imageKey, img.file);
                // Removed space after key in console log
                // console.log(`Appending file to FormData with key: ${imageKey}`);
            }
        });
        // Removed space after counter in console log
        // console.log(`Total image files appended: ${imageCounter}`);

        try {
            // Removed spaces in URL
            const response = await axios.patch(
                `${baseURL}/api/vehicle/update/${vehicle._id}`,
                updatedVehicleData,
                {
                    headers: {
                        // Removed space after token
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200) {
                alert("Vehicle updated successfully!");
                if (onVehicleUpdated) {
                    onVehicleUpdated(response.data.vehicle);
                }
                onClose();
            } else {
                alert(response.data?.message || "An error occurred during update.");
            }
        } catch (error) {
            console.error("Error updating vehicle:", error);
            // Removed space before period in alert message
            alert(`Failed to update vehicle.${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200 max-h-[90vh] flex flex-col">
                <h2 className="text-lg font-semibold mb-4 text-blue-700 text-center">Update Vehicle</h2>

                <input
                    type="file"
                    accept="image/*"
                    ref={replaceImageInputRef}
                    onChange={handleReplaceImageChange}
                    style={{ display: 'none' }}
                />

                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-grow overflow-y-auto pr-2">
                    {/* Vehicle Type */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Vehicle Type</label>
                        <input
                            type="text"
                            name="vehicleType"
                            value={formData.vehicleType}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
                            placeholder="Enter vehicle type (e.g., Truck, Van)"
                            required
                        />
                    </div>

                    {/* Vehicle Capacity */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Capacity (KG)</label>
                        <input
                            type="number"
                            name="vehicleCapacity"
                            value={formData.vehicleCapacity}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
                            placeholder="Enter capacity in KG"
                            required
                        />
                    </div>

                    {/* Registration Number */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Registration Number</label>
                        <input
                            type="text"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
                            placeholder="Enter registration number"
                            required
                        />
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Availability</label>
                        <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="availability"
                                    value="true"
                                    checked={formData.availability === true}
                                    onChange={() => setFormData({ ...formData, availability: true })}
                                    className="w-4 h-4 accent-blue-700"
                                />
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-600 text-white">
                                    Available
                                </span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="availability"
                                    value="false"
                                    checked={formData.availability === false}
                                    onChange={() => setFormData({ ...formData, availability: false })}
                                    className="w-4 h-4 accent-red-600"
                                />
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-600 text-white">
                                    Not Available
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Approved (Admin Only) */}
                    {role === "admin" && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="approved"
                                checked={formData.approved}
                                onChange={handleChange}
                                className="w-4 h-4 accent-blue-700"
                            />
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-700 text-white">
                                {formData.approved ? "Approved" : "Pending"}
                            </span>
                        </div>
                    )}

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-2">Vehicle Images (Max 4)</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {formData.images.map((img, index) => (
                                <div key={img.key || img.preview || index} className="relative w-full aspect-square border border-gray-300 rounded-lg overflow-hidden shadow-sm group">
                                    <img
                                        // Removed space after filename
                                        src={img.preview || `${imageurl}${img.filename}`}
                                        // Removed space after index in alt text
                                        alt={`Vehicle Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-center justify-center space-x-2">
                                        <button
                                            type="button"
                                            title="Replace Image"
                                            className="text-white text-lg p-1 rounded-full bg-blue-500 bg-opacity-70 hover:bg-opacity-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={() => triggerReplaceImage(index)}
                                            disabled={isDeletingImage || isSubmitting}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            type="button"
                                            title="Delete Image"
                                            className="text-white text-lg p-1 rounded-full bg-red-500 bg-opacity-70 hover:bg-opacity-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={() => handleRemoveImage(index)}
                                            disabled={isDeletingImage || isSubmitting}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {formData.images.length < 4 && (
                                <label className="w-full aspect-square border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-3xl rounded-lg cursor-pointer hover:border-blue-600 hover:text-blue-600 transition">
                                    +
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleAddImageChange}
                                        className="hidden"
                                        disabled={isDeletingImage || isSubmitting}
                                    />
                                </label>
                            )}
                        </div>
                        {isDeletingImage && <p className="text-sm text-yellow-600 mt-2">Deleting image...</p>}
                    </div>
                </form>

                {/* Buttons */}
                <div className="flex justify-center space-x-4 mt-auto pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-stone-200 text-stone-700 text-sm rounded-md hover:bg-stone-300 transition disabled:opacity-50"
                        disabled={isSubmitting || isDeletingImage}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-wait"
                        disabled={isSubmitting || isDeletingImage}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Vehicle'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateVehicleModal;