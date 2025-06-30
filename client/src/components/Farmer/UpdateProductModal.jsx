/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import baseURL, { imageurl } from "../../baseurl";
import { useAuth } from "../../auth/AuthToken";
import axios from "axios";
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

const UpdateProductModal = ({ product, isOpen, onClose, onProductUpdated }) => {
    const { role, token } = useAuth();
    const [isDeletingImage, setIsDeletingImage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Normalize varieties: Ensure it's an array of strings
    const normalizeVarieties = (varieties) => {
        if (!varieties) return [];
        if (Array.isArray(varieties)) return [...varieties];
        if (typeof varieties === 'string') {
            try {
                // If varieties is a JSON string like `["kala chusa", "chita chunsa"]`
                const parsed = JSON.parse(varieties);
                return Array.isArray(parsed) ? parsed : varieties.split(',').map(v => v.trim());
            } catch (e) {
                // If it's a comma-separated string like "kala chusa, chita chunsa"
                return varieties.split(',').map(v => v.trim());
            }
        }
        return [];
    };

    // Initialize formData with all fields from product
    const [formData, setFormData] = useState({
        name: product.name || '',
        category: product.category || '',
        description: product.description || '',
        price: product.price || 0,
        unit: product.unit || '',
        quantity: product.quantity || 0,
        minOrderQty: product.minOrderQty || 1,
        maxOrderQty: product.maxOrderQty || 0,
        varieties: normalizeVarieties(product.varieties), // Normalize varieties
        availability: product.availability !== undefined ? product.availability : true,
        approved: product.approved !== undefined ? product.approved : false,
        images: (product.images || []).map(img => ({
            ...img,
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

    // Handle changes for varieties array
    const handleVarietyChange = (index, value) => {
        const updatedVarieties = [...formData.varieties];
        updatedVarieties[index] = value;
        setFormData({ ...formData, varieties: updatedVarieties });
    };

    // Add a new variety
    const addVariety = () => {
        setFormData({ ...formData, varieties: [...formData.varieties, ''] });
    };

    // Remove a variety
    const removeVariety = (index) => {
        const updatedVarieties = formData.varieties.filter((_, i) => i !== index);
        setFormData({ ...formData, varieties: updatedVarieties });
    };

    // Image handling functions (unchanged)
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

        if (!window.confirm(`Are you sure you want to permanently delete this image (${imageToRemove.filename})?`)) {
            return;
        }

        setIsDeletingImage(true);
        try {
            const response = await axios.patch(
                `${baseURL}/api/farmerproduct/delete-image/${product._id}`,
                { imageKey: imageToRemove.key },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200) {
                alert("Image deleted successfully!");
                setFormData((prev) => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== indexToRemove),
                }));
                if (onProductUpdated) {
                    onProductUpdated(response.data.product);
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const updatedProductData = new FormData();

        // Append all fields
        updatedProductData.append("name", formData.name);
        updatedProductData.append("category", formData.category);
        updatedProductData.append("description", formData.description);
        updatedProductData.append("price", formData.price);
        updatedProductData.append("unit", formData.unit);
        updatedProductData.append("quantity", formData.quantity);
        updatedProductData.append("minOrderQty", formData.minOrderQty);
        updatedProductData.append("maxOrderQty", formData.maxOrderQty);
        // Append varieties as individual entries
        formData.varieties.forEach((variety, index) => {
            updatedProductData.append(`varieties[${index}]`, variety);
        });
        updatedProductData.append("availability", String(formData.availability));

        if (role === "admin") {
            updatedProductData.append("approved", String(formData.approved));
        }

        // Append image files (unchanged)
        let imageCounter = 0;
        formData.images.forEach((img, index) => {
            if (img.file) {
                imageCounter++;
                const imageKey = `image${index + 1}`;
                updatedProductData.append(imageKey, img.file);
                // console.log(`Appending file to FormData with key: ${imageKey}`);
            }
        });
        // console.log(`Total image files appended: ${imageCounter}`);

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
                if (onProductUpdated) {
                    onProductUpdated(response.data.product);
                }
                onClose();
            } else {
                alert(response.data?.message || "An error occurred during update.");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            alert(`Failed to update product. ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200 max-h-[90vh] flex flex-col">
                <h2 className="text-lg font-semibold mb-4 text-green-700 text-center">Update Product</h2>

                <input
                    type="file"
                    accept="image/*"
                    ref={replaceImageInputRef}
                    onChange={handleReplaceImageChange}
                    style={{ display: 'none' }}
                />

                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-grow overflow-y-auto pr-2">
                    {/* Name */}
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

                    {/* Category */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Category</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                            placeholder="Enter category"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                            placeholder="Enter product description"
                            rows={3}
                        />
                    </div>

                    {/* Price */}
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

                    {/* Unit */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Unit</label>
                        <input
                            type="text"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                            placeholder="e.g., kg, piece"
                        />
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                            placeholder="Enter quantity"
                        />
                    </div>

                    {/* Min Order Quantity */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Minimum Order Quantity</label>
                        <input
                            type="number"
                            name="minOrderQty"
                            value={formData.minOrderQty}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                            placeholder="Enter minimum order quantity"
                        />
                    </div>

                    {/* Max Order Quantity */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Maximum Order Quantity</label>
                        <input
                            type="number"
                            name="maxOrderQty"
                            value={formData.maxOrderQty}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                            placeholder="Enter maximum order quantity"
                        />
                    </div>

                    {/* Varieties */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">Varieties</label>
                        {formData.varieties.map((variety, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={variety}
                                    onChange={(e) => handleVarietyChange(index, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                                    placeholder={`Variety ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeVariety(index)}
                                    className="text-red-600 hover:text-red-800"
                                    disabled={isSubmitting || isDeletingImage}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addVariety}
                            className="flex items-center text-sm text-green-600 hover:text-green-800"
                            disabled={isSubmitting || isDeletingImage}
                        >
                            <FaPlus className="mr-1" /> Add Variety
                        </button>
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

                    {/* Image Upload Section (Unchanged) */}
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-2">Product Images (Max 4)</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {formData.images.map((img, index) => (
                                <div key={img.key || img.preview || index} className="relative w-full aspect-square border border-gray-300 rounded-lg overflow-hidden shadow-sm group">
                                    <img
                                        src={img.preview || `${imageurl}${img.filename}`}
                                        alt={`Product Image ${index + 1}`}
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
                                <label className="w-full aspect-square border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-3xl rounded-lg cursor-pointer hover:border-green-600 hover:text-green-600 transition">
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
                        className="px-6 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-wait"
                        disabled={isSubmitting || isDeletingImage}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateProductModal;