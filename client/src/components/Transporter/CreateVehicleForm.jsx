import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/AuthToken';
import baseURL from '../../baseurl';
import { FaTrash, FaUpload, FaSyncAlt } from 'react-icons/fa';
import LoadingSpinner from '../Common/LoadingSpinner';

const CreateVehicleForm = () => {
    const { token, user } = useAuth();
    const transporterId = user?._id;

    const initialFormData = {
        vehicleType: '',
        vehicleCapacity: '',
        registrationNumber: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const [images, setImages] = useState([]);
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
        setErrorMessage(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!token || !transporterId) return setErrorMessage('Authentication required.');
        if (!formData.vehicleType || !formData.vehicleCapacity || !formData.registrationNumber)
            return setErrorMessage('All fields are required.');

        const capacity = Number(formData.vehicleCapacity);
        if (capacity <= 0) return setErrorMessage('Capacity must be greater than 0.');

        setIsLoading(true);
        const vehicleFormData = new FormData();
        vehicleFormData.append('vehicleType', formData.vehicleType);
        vehicleFormData.append('vehicleCapacity', formData.vehicleCapacity);
        vehicleFormData.append('registrationNumber', formData.registrationNumber);
        images.forEach((imgData, index) => vehicleFormData.append(`image${index + 1}`, imgData.file));

        try {
            const response = await axios.post(
                `${baseURL}/api/vehicle/create/${transporterId}`,
                vehicleFormData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                setSuccessMessage('Vehicle created successfully!');
                handleReset();
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setErrorMessage(response.data?.message || 'Creation failed.');
            }
        } catch (err) {
            console.error('Create Vehicle Error:', err);
            setErrorMessage(err.response?.data?.message || err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-3 rounded-lg shadow-md w-full max-w-2xl mx-auto border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col text-sm">
            <h2 className="text-lg font-semibold mb-2 text-center text-green-700">Create New Vehicle</h2>
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow">
                <div className="mb-2">
                    <label htmlFor="vehicleType" className="block text-gray-600 mb-1">
                        Vehicle Type <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="vehicleType"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full p-1.5 border outline-none border-gray-300 rounded  focus:ring-green-600 focus:border-green-600"
                        placeholder="e.g., Truck, Van"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    <div>
                        <label htmlFor="vehicleCapacity" className="block text-gray-600 mb-1">
                            Capacity (KG) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="vehicleCapacity"
                            name="vehicleCapacity"
                            value={formData.vehicleCapacity}
                            onChange={handleChange}
                            required
                            min="1"
                            disabled={isLoading}
                            className="w-full p-1.5 border outline-none border-gray-300 rounded focus:ring-green-600 focus:border-green-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="registrationNumber" className="block text-gray-600 mb-1">
                            Registration Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="registrationNumber"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="w-full p-1.5 border border-gray-300 outline-none rounded focus:ring-green-600 focus:border-green-600"
                            placeholder="e.g., ABC123"
                        />
                    </div>
                </div>

                <div className="mb-2">
                    <label className="block text-gray-600 mb-1">Images (Max 4)</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {images.map((imgData, index) => (
                            <div key={imgData.preview} className="relative w-full aspect-square border rounded overflow-hidden group">
                                <img src={imgData.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
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
                            <label className={`w-full aspect-square border-2 border-dashed rounded flex items-center justify-center text-gray-400 ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-green-600 hover:text-green-600'}`}>
                                <FaUpload className="text-base" />
                                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" disabled={isLoading} />
                            </label>
                        )}
                    </div>
                </div>

                <div className="h-6">
                    {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}
                    {successMessage && <p className="text-green-600 text-center">{successMessage}</p>}
                </div>

                <div className="mt-2 flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-sm flex items-center"
                    >
                        <FaSyncAlt className="mr-1" /> Reset
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !transporterId || !token}
                        className="px-4 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white text-sm flex items-center"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Create Vehicle'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateVehicleForm;
