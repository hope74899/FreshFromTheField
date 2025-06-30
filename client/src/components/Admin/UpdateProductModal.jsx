/* eslint-disable react/prop-types */
import { useState, useRef } from "react"; // Import useRef
import baseURL, { imageurl } from "../../baseurl";
import { useAuth } from "../../auth/AuthToken";
import axios from "axios";
import { FaTrash, FaEdit } from 'react-icons/fa'; // Example icons

const UpdateProductModal = ({ product, isOpen, onClose, onProductUpdated }) => { // Added onProductUpdated prop
    const { role, token } = useAuth(); // Get user role and token
    const [isDeletingImage, setIsDeletingImage] = useState(false); // State for delete loading
    const [isSubmitting, setIsSubmitting] = useState(false); // State for main form submission loading


    const [formData, setFormData] = useState({
        name: product.name || '', // Add defaults for safety
        price: product.price || 0,
        description: product.description || '',
        availability: product.availability !== undefined ? product.availability : true, // Default to true if undefined
        approved: product.approved !== undefined ? product.approved : false,
        // Ensure images array always exists and map existing images to desired structure
        images: (product.images || []).map(img => ({
            ...img, // Keep existing properties like key, filename
            preview: `${imageurl}${img.filename}` // Add preview URL for existing images
        }))
    });

    // Ref for the hidden file input used for replacing images
    const replaceImageInputRef = useRef(null);
    const [replaceImageIndex, setReplaceImageIndex] = useState(null); // Index of image to replace

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // --- Image Handling ---

    // ADD: Handle selecting a replacement image
    const handleReplaceImageChange = (e) => {
        const file = e.target.files[0];
        if (!file || replaceImageIndex === null) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => {
                const updatedImages = [...prev.images];
                updatedImages[replaceImageIndex] = {
                    // Keep original key if it exists, otherwise generate temp one? No, let backend handle key based on index.
                    file: file,
                    preview: reader.result // Use reader result for preview
                };
                return { ...prev, images: updatedImages };
            });
            setReplaceImageIndex(null); // Reset index
        };
        reader.readAsDataURL(file);

        // Clear the file input value so the same file can be selected again if needed
        e.target.value = null;
    };

    // ADD: Trigger the hidden file input for replacement
    const triggerReplaceImage = (index) => {
        setReplaceImageIndex(index);
        replaceImageInputRef.current?.click(); // Use optional chaining
    };


    // MODIFIED: Handle Image Upload (for adding NEW images)
    const handleAddImageChange = (e) => { // Renamed from handleImageChange
        const files = Array.from(e.target.files);

        if (formData.images.length + files.length > 4) {
            alert("You can only upload up to 4 images.");
            return;
        }

        const newImages = files.map((file) => ({
            file, // Store the file object
            preview: URL.createObjectURL(file), // Create a temporary preview URL
        }));

        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
        // Clear the file input if needed (might not be necessary for the 'add' button)
        e.target.value = null;
    };


    // MODIFIED: Handle Image Removal (Calls API for existing images)
    const handleRemoveImage = async (indexToRemove) => {
        const imageToRemove = formData.images[indexToRemove];

        // If imageToRemove.file exists, it's a newly added image not yet saved
        if (imageToRemove.file && !imageToRemove.filename) {
            setFormData((prev) => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== indexToRemove),
            }));
            // Revoke object URL for newly added images to prevent memory leaks
            if (imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
                URL.revokeObjectURL(imageToRemove.preview);
            }
            return; // No API call needed
        }

        // --- If it's an existing image (has filename, no file object from current session) ---
        if (!imageToRemove.key) {
            console.error("Cannot delete image: Missing 'key' property.", imageToRemove);
            alert("Error: Cannot identify image to delete. Missing key.");
            return;
        }

        // Confirmation dialog
        if (!window.confirm(`Are you sure you want to permanently delete this image (${imageToRemove.filename})?`)) {
            return;
        }

        setIsDeletingImage(true);
        try {
            // console.log(`Attempting to delete image with key: ${imageToRemove.key} for product ID: ${product._id}`);

            const response = await axios.patch( // Use PATCH or DELETE as per your backend route
                `${baseURL}/api/farmerproduct/delete-image/${product._id}`,
                { imageKey: imageToRemove.key }, // Send the key of the image to delete
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200) {
                alert("Image deleted successfully!");
                // Update frontend state AFTER successful API call
                setFormData((prev) => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== indexToRemove),
                }));
                // Optionally call parent update function if needed immediately
                if (onProductUpdated) {
                    onProductUpdated(response.data.product); // Assuming API returns updated product
                }
            } else {
                alert(response.data?.message || "Failed to delete image from server.");
            }
        } catch (error) {
            console.error("Error deleting image:", error);
            alert(`Failed to delete image. ${error.response?.data?.message || error.message}`);
        } finally {
            setIsDeletingImage(false);
        }
    };

    // MODIFIED: Handle Form Submission (API Call)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Set loading state
        const updatedProductData = new FormData(); // Renamed variable

        // Append text fields
        updatedProductData.append("name", formData.name);
        updatedProductData.append("price", formData.price);
        updatedProductData.append("description", formData.description);
        updatedProductData.append("availability", String(formData.availability)); // Ensure string conversion

        if (role === "admin") {
            updatedProductData.append("approved", String(formData.approved));
        }

        // Append image files with keys based on their final position (1-based index)
        let imageCounter = 0; // Keep track of actual image files being sent
        formData.images.forEach((img, index) => {
            if (img.file) { // Only append if it's a file object (new or replacement)
                imageCounter++;
                const imageKey = `image${index + 1}`; // Use 1-based index for key
                updatedProductData.append(imageKey, img.file);
                // console.log(`Appending file to FormData with key: ${imageKey}`);
            }
        });
        // console.log(`Total image files appended: ${imageCounter}`);


        // console.log('FormData to be sent:');
        // for (let pair of updatedProductData.entries()) {
        //     console.log(pair[0] + ': ', pair[1]);
        // }

        try {
            const response = await axios.patch(
                `${baseURL}/api/farmerproduct/update/${product._id}`,
                updatedProductData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200) {
                alert("Product updated successfully!");
                if (onProductUpdated) { // Call parent update function if provided
                    onProductUpdated(response.data.product);
                }
                onClose(); // Close Modal
            } else {
                alert(response.data?.message || "An error occurred during update.");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            alert(`Failed to update product. ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false); // Reset loading state
        }
    };


    // --- Render ---
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200 max-h-[90vh] flex flex-col"> {/* Added max-h */}
                <h2 className="text-lg font-semibold mb-4 text-green-700 text-center">Update Product</h2>

                {/* Hidden file input for replacing images */}
                <input
                    type="file"
                    accept="image/*"
                    ref={replaceImageInputRef}
                    onChange={handleReplaceImageChange}
                    style={{ display: 'none' }}
                />

                {/* Added overflow-y-auto to form */}
                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-grow overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar */}
                    {/* ... (keep other form inputs: name, price, description, availability, approved) ... */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                            placeholder="Enter product name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                            placeholder="Enter price"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                            placeholder="Enter product description"
                            rows={3} // Give it a bit more space
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Availability</label>
                        {/* ... availability radio buttons ... */}
                        <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="availability"
                                    value="true"
                                    checked={formData.availability === true}
                                    onChange={() => setFormData({ ...formData, availability: true })}
                                    className="w-4 h-4 accent-green-700"
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
                                    Out of Stock
                                </span>
                            </label>
                        </div>
                    </div>
                    {role === "admin" && (
                        <div className="flex items-center space-x-2">
                            {/* ... approved checkbox ... */}
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


                    {/* --- Image Upload Section --- */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-2">Product Images (Max 4)</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3"> {/* Adjusted grid cols */}
                            {formData.images.map((img, index) => (
                                <div key={img.key || img.preview || index} className="relative w-full aspect-square border border-gray-300 rounded-lg overflow-hidden shadow-sm group"> {/* Use aspect-square and unique key */}
                                    <img
                                        // Use preview for new/replaced images, filename for existing
                                        src={img.preview || `${imageurl}${img.filename}`}
                                        alt={`Product Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay for buttons */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-center justify-center space-x-2">
                                        {/* Replace Button */}
                                        <button
                                            type="button"
                                            title="Replace Image"
                                            className="text-white text-lg p-1 rounded-full bg-blue-500 bg-opacity-70 hover:bg-opacity-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={() => triggerReplaceImage(index)}
                                            disabled={isDeletingImage || isSubmitting}
                                        >
                                            <FaEdit />
                                        </button>
                                        {/* Delete Button */}
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

                            {/* Add Image Button (Only if <4 images) */}
                            {formData.images.length < 4 && (
                                <label className="w-full aspect-square border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-3xl rounded-lg cursor-pointer hover:border-green-600 hover:text-green-600 transition">
                                    +
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple // Allow multiple selection for adding
                                        onChange={handleAddImageChange} // Use the specific handler for adding
                                        className="hidden"
                                        disabled={isDeletingImage || isSubmitting}
                                    />
                                </label>
                            )}
                        </div>
                        {isDeletingImage && <p className="text-sm text-yellow-600 mt-2">Deleting image...</p>}
                    </div>

                    {/* Submit/Cancel Buttons - Placed outside the scrolling form area */}
                </form>
                <div className="flex justify-center space-x-4 mt-auto pt-4 border-t"> {/* Use mt-auto to push to bottom */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-stone-200 text-stone-700 text-sm rounded-md hover:bg-stone-300 transition disabled:opacity-50"
                        disabled={isSubmitting || isDeletingImage}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit" // Change type to submit to trigger form onSubmit
                        onClick={handleSubmit} // Keep onClick as well for direct trigger if needed, though onSubmit is better
                        className="px-6 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-wait"
                        disabled={isSubmitting || isDeletingImage} // Disable while submitting or deleting
                    >
                        {isSubmitting ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateProductModal;