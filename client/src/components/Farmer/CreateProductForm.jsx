import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/AuthToken';
import baseURL from '../../baseurl';
import { FaTrash, FaUpload, FaSyncAlt } from 'react-icons/fa';
import LoadingSpinner from '../Common/LoadingSpinner';

const productCategories = ['Vegetable', 'Fruit', 'Grain', 'Dairy', 'Meat', 'Poultry', 'Other'];

const CreateProductForm = () => {
    const { token, user } = useAuth();
    const farmerId = user?._id;

    const initialFormData = {
        name: '',
        category: '',
        description: '',
        price: '',
        unit: 'kg',
        quantity: '',
        minOrderQty: 1,
        maxOrderQty: 100,
        varieties: [],
    };

    const [formData, setFormData] = useState(initialFormData);
    const [images, setImages] = useState([]);
    const [varietyInput, setVarietyInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        return () => {
            images.forEach(image => {
                if (image.preview && image.preview.startsWith('blob:')) URL.revokeObjectURL(image.preview);
            });
        };
    }, [images]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrorMessage(null);
        setSuccessMessage(null);
    };

    const handleVarietyInputChange = e => {
        setVarietyInput(e.target.value);
        setErrorMessage(null);
    };

    const normalizeVariety = input => {
        return input.replace(/\s+/g, ' ').trim();
    };

    const handleAddVariety = () => {
        const normalizedInput = normalizeVariety(varietyInput);
        if (!normalizedInput) {
            setErrorMessage('Please enter a valid variety (letters, numbers, or spaces).');
            return;
        }
        const lowerCaseVarieties = formData.varieties.map(v => v.toLowerCase());
        if (lowerCaseVarieties.includes(normalizedInput.toLowerCase())) {
            setErrorMessage('This variety is already added.');
            setVarietyInput('');
            return;
        }
        setFormData(prev => ({ ...prev, varieties: [...prev.varieties, normalizedInput] }));
        setVarietyInput('');
    };

    const handleRemoveVariety = indexToRemove => {
        setFormData(prev => ({
            ...prev,
            varieties: prev.varieties.filter((_, index) => index !== indexToRemove),
        }));
        setErrorMessage(null);
    };

    const handleImageChange = e => {
        setErrorMessage(null);
        setSuccessMessage(null);
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        if (images.length + files.length > 4) {
            setErrorMessage('Maximum 4 images allowed.');
            e.target.value = '';
            return;
        }

        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages(prev => [...prev, ...newImages]);
        e.target.value = '';
    };

    const handleRemoveImage = indexToRemove => {
        setImages(prev => {
            const imageToRemove = prev[indexToRemove];
            const updatedImages = prev.filter((_, index) => index !== indexToRemove);
            if (imageToRemove?.preview && imageToRemove.preview.startsWith('blob:'))
                URL.revokeObjectURL(imageToRemove.preview);
            return updatedImages;
        });
        setErrorMessage(null);
    };

    const handleReset = () => {
        setFormData(initialFormData);
        images.forEach(image => {
            if (image.preview && image.preview.startsWith('blob:')) URL.revokeObjectURL(image.preview);
        });
        setImages([]);
        setVarietyInput('');
        setErrorMessage(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!token || !farmerId) return setErrorMessage('Authentication required.');
        if (!formData.name || !formData.category || !formData.price)
            return setErrorMessage('Name, Category, and Price are required.');

        const minQty = formData.minOrderQty ? Number(formData.minOrderQty) : 1;
        const maxQty = formData.maxOrderQty ? Number(formData.maxOrderQty) : 100;

        if (minQty > maxQty)
            return setErrorMessage('Minimum order quantity cannot exceed maximum order quantity.');

        setIsLoading(true);
        const productFormData = new FormData();
        productFormData.append('name', formData.name);
        productFormData.append('category', formData.category);
        productFormData.append('description', formData.description);
        productFormData.append('price', formData.price || 0);
        productFormData.append('unit', formData.unit);
        productFormData.append('quantity', formData.quantity || 0);
        productFormData.append('minOrderQty', minQty);
        productFormData.append('maxOrderQty', maxQty);
        formData.varieties.forEach((variety, index) =>
            productFormData.append(`varieties[${index}]`, variety)
        );
        images.forEach((imgData, index) => productFormData.append(`image${index + 1}`, imgData.file));

        try {
            const response = await axios.post(
                `${baseURL}/api/farmerproduct/create/${farmerId}`,
                productFormData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                setSuccessMessage('Product created successfully!');
                handleReset();
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setErrorMessage(response.data?.message || 'Creation failed.');
            }
        } catch (err) {
            console.error('Create Product Error:', err);
            setErrorMessage(err.response?.data?.message || err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto border border-gray-200 max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-semibold mb-6 text-center text-green-700">Create New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-5 flex-grow overflow-y-auto pr-2">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="w-full p-2.5 border border-gray-300 rounded-md outline-none focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="w-full p-2.5 border border-gray-300 rounded-md outline-none focus:ring-green-500 focus:border-green-500 bg-white"
                        >
                            <option value="" disabled>
                                -- Select Category --
                            </option>
                            {productCategories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                            Price <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            disabled={isLoading}
                            className="w-full p-2.5 border border-gray-300 rounded-md outline-none  focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="0"
                            disabled={isLoading}
                            className="w-full p-2.5 border border-gray-300 rounded-md outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                            Unit
                        </label>
                        <select
                            id="unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full p-2.5 border border-gray-300 rounded-md outline-none focus:ring-green-500 focus:border-green-500 bg-white"
                        >
                            {['kg', 'g', 'litre', 'piece', 'dozen', 'bunch', 'box/crate'].map(unit => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="minOrderQty" className="block text-sm font-medium text-gray-700 mb-1">
                            Min Order Quantity
                        </label>
                        <input
                            type="number"
                            id="minOrderQty"
                            name="minOrderQty"
                            value={formData.minOrderQty}
                            onChange={handleChange}
                            min="1"
                            step="1"
                            disabled={isLoading}
                            className="w-full p-2.5 border border-gray-300 rounded-md outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="maxOrderQty" className="block text-sm font-medium text-gray-700 mb-1">
                            Max Order Quantity
                        </label>
                        <input
                            type="number"
                            id="maxOrderQty"
                            name="maxOrderQty"
                            value={formData.maxOrderQty}
                            onChange={handleChange}
                            min="1"
                            step="1"
                            disabled={isLoading}
                            className="w-full p-2.5 border border-gray-300 rounded-md outline-none  focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        disabled={isLoading}
                        className="w-full p-2.5 border border-gray-300 rounded-md outline-none focus:ring-green-500 focus:border-green-500"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Varieties</label>
                    <div className="flex items-center space-x-2 mb-3">
                        <input
                            type="text"
                            value={varietyInput}
                            onChange={handleVarietyInputChange}
                            placeholder="Enter variety (e.g., Red Apple)"
                            disabled={isLoading}
                            className="w-full p-2.5 border border-gray-300 rounded-md outline-none focus:ring-green-500 focus:border-green-500"
                        />
                        <button
                            type="button"
                            onClick={handleAddVariety}
                            disabled={isLoading}
                            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            Add
                        </button>
                    </div>
                    {formData.varieties.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.varieties.map((variety, index) => (
                                <div
                                    key={index}
                                    className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                                >
                                    <span>{variety}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVariety(index)}
                                        disabled={isLoading}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Images (Max 4)</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                        {images.map((imgData, index) => (
                            <div
                                key={imgData.preview}
                                className="relative w-full aspect-square border rounded-lg overflow-hidden group"
                            >
                                <img
                                    src={imgData.preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    disabled={isLoading}
                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 hover:bg-red-700"
                                >
                                    <FaTrash size={10} />
                                </button>
                            </div>
                        ))}
                        {images.length < 4 && (
                            <label
                                className={`w-full aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-green-500 hover:text-green-600'
                                    }`}
                            >
                                <FaUpload className="text-2xl mb-1" />
                                <span className="text-xs text-center">Add Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="h-8">
                    {errorMessage && <p className="text-sm text-red-600 text-center">{errorMessage}</p>}
                    {successMessage && <p className="text-sm text-green-600 text-center">{successMessage}</p>}
                </div>

                <div className="pt-4 border-t mt-auto flex flex-col sm:flex-row sm:justify-end sm:space-x-3">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isLoading}
                        className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition mb-2 sm:mb-0 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <FaSyncAlt className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                        Reset Form
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !farmerId || !token}
                        className={`w-full sm:w-auto flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition ${isLoading || !farmerId || !token ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading ? <LoadingSpinner /> : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProductForm;