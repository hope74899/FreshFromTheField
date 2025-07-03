import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import baseURL, { imageurl } from '../../baseurl';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaRupeeSign } from 'react-icons/fa6';
import { useAuth } from '../../auth/AuthToken';
import { toast } from 'react-toastify';
import RelatedFarmerProducts from '../../components/Farmer/RelatedFarmerProducts';

const ProductDetail = () => {
    const { token, fetchCartCount, role, user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [quantityError, setQuantityError] = useState('');
    const [adding, setAdding] = useState(false);
    const [selectedVariety, setSelectedVariety] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    const getProduct = async () => {
        try {
            const response = await axios.get(`${baseURL}/api/farmerproduct/${id}`);
            if (response.status === 200) {
                const data = response.data.product;
                setProduct(data);
                setCoverImage(`${imageurl}${data.images[0]?.filename}` || "/blankProfile.png");
            } else {
                setError("Product not found.");
            }
        } catch (err) {
            setError("Failed to load product. Please check your network connection.");
            console.log(err);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    useEffect(() => {
        getProduct();
    }, [id]);

    const handleThumbnailClick = (image) => {
        setCoverImage(image);
    };

    const [showDetails, setShowDetails] = useState(false);
    const handleViewDetailsClick = () => {
        if (user?.isLoggin) {
            if (role === 'buyer' || role === 'admin') {
                setShowDetails(true);
            } else {
                toast.error("You are not authorized to view farmer details");
            }
        } else {
            toast.info("Sign up to view farmer details");
        }
    };

    const handleViewProfileClick = (id) => {
        if (user?.isLoggin) {
            if (role === 'buyer' || role === 'admin') {
                navigate(`/farmerprofile/${id}`);
            } else {
                toast.error("You are not authorized to view farmer profile");
            }
        } else {
            toast.info("Sign up to view farmer profile");
        }
    };

    const handleQuantityChange = (value) => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 1) {
            setQuantity(1);
            setQuantityError('Quantity must be a positive number');
        } else {
            setQuantity(numValue);
            // Clear error if within range
            const minQty = product?.minOrderQty || 1;
            const maxQty = product?.maxOrderQty || 100;
            if (numValue >= minQty && numValue <= maxQty) {
                setQuantityError('');
            }
        }
    };

    const handleAddToCart = async () => {
        const minQty = product?.minOrderQty || 1;
        const maxQty = product?.maxOrderQty || 100;

        // Validate quantity
        if (quantity < minQty || quantity > maxQty) {
            setQuantityError(`Quantity must be between ${minQty} and ${maxQty}`);
            return;
        }

        try {
            setAdding(true);
            const response = await axios.post(
                `${baseURL}/api/cart/add`,
                {
                    productId: product._id,
                    quantity,
                    selectedVariety,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.status === 200) {
                fetchCartCount();
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to add to cart.');
        } finally {
            setAdding(false);
        }
    };

    const farmerInfo = useMemo(() => {
        if (!product?.farmer) {
            return null;
        }

        const { farmer } = product;


        return (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800">Farmer Information</h3>
                <div className="flex items-center mt-3 space-x-3">
                    <img
                        src={farmer.profileImage ? `${imageurl}${farmer.profileImage}` : '/blankProfile.png'}
                        alt={`${farmer.firstName} ${farmer.lastName}`}
                        className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div>
                        <p className="text-gray-900 font-medium">{farmer.firstName} {farmer.lastName}</p>
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                            <FaMapMarkerAlt className="text-yellow-400" /> {farmer.farmerDetails?.farmLocation || "Location not available"}
                        </p>
                    </div>
                </div>

                <div className={`mt-3 text-gray-700 text-sm ${showDetails ? '' : 'blur-md'}`}>
                    <p><strong className="font-medium">Farm Name:</strong> {farmer.farmerDetails?.farmName || "N/A"}</p>
                    <p>
                        <strong className="font-medium">Address:</strong> {farmer.city}, {farmer.province}, {farmer.country}
                    </p>
                    <p><strong className="font-medium">Phone:</strong> {farmer.farmerDetails?.farmerPhoneNumber || "N/A"}</p>
                    <p><strong className="font-medium">Email:</strong> {farmer.email || "N/A"}</p>
                </div>
                <div className="mt-4">
                    {!showDetails && (
                        <button
                            onClick={handleViewDetailsClick}
                            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                        >
                            View Details
                        </button>
                    )}
                    <button
                        onClick={() => handleViewProfileClick(farmer._id)}
                        className="inline-block mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        View Profile
                    </button>
                </div>
            </div>
        );
    }, [product?.farmer, showDetails]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div
                    className="w-32 aspect-square rounded-full relative flex justify-center items-center animate-[spin_3s_linear_infinite] z-40 bg-[conic-gradient(white_0deg,white_300deg,transparent_270deg,transparent_360deg)] before:animate-[spin_2s_linear_infinite] before:absolute before:w-[60%] before:aspect-square before:rounded-full before:z-[80] before:bg-[conic-gradient(white_0deg,white_270deg,transparent_180deg,transparent_360deg)] after:absolute after:w-3/4 after:aspect-square after:rounded-full after:z-[60] after:animate-[spin_3s_linear_infinite] after:bg-[conic-gradient(#065f46_0deg,#065f46_180deg,transparent_180deg,transparent_360deg)]"
                >
                    <span
                        className="absolute w-[85%] aspect-square rounded-full z-[60] animate-[spin_诊_5s_linear_infinite] bg-[conic-gradient(#34d399_0deg,#34d399_180deg,transparent_180deg,transparent_360deg)]"
                    ></span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 font-semibold mt-10">{error}</div>;
    }

    if (!product) {
        return <div className="text-center text-red-500 font-semibold mt-10">Product not found</div>;
    }

    return (
        <div className=" flex flex-col  bg-white">
            <div className="flex flex-col md:flex-row gap-10 p-10">
                {/* Image Gallery */}
                <div className="flex flex-col w-full sm:w-full md:w-1/2 gap-5">
                    {/* Cover Image */}
                    <div className="w-full h-96 2xl:h-[500px] aspect-w-4 aspect-h-3">
                        <img
                            src={coverImage}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg shadow-md"
                            onError={(e) => {
                                e.target.src = '/blankProfile.png';
                            }}
                        />
                    </div>

                    {/* Thumbnail Slider */}
                    <div className="mt-2 relative">
                        <div className="flex justify-center items-center overflow-x-auto space-x-2 scrollbar-hide">
                            {product.images.map((image, index) => (
                                <div
                                    key={index}
                                    className="w-32 h-24 flex-shrink-0 rounded-md overflow-hidden cursor-pointer shadow-sm hover:opacity-75 transition-opacity duration-200"
                                    onClick={() => handleThumbnailClick(`${imageurl}${image.filename}`)}
                                >
                                    <img
                                        src={`${imageurl}${image.filename}`}
                                        alt={`Thumbnail ${index}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Product Details */}
                <div className="flex flex-col w-full sm:w-full md:w-1/2">
                    <div className=" space-y-5">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-gray-900">{product.name}</h2>
                            <div className="flex items-center space-x-1">
                                <FaRupeeSign className="text-gray-500" />
                                <span className="text-xl font-semibold text-gray-900">{product.price}</span>
                                <span className="text-sm text-gray-500">/ {product.unit}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700">{product.description}</p>

                        {/* Info Section */}
                        <div className="text-sm text-gray-700 space-y-1">
                            <p><span className="font-medium">Category:</span> {product.category}</p>
                            <p>
                                <span className="font-medium">Availability:</span>{' '}
                                <span className={product.availability ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                    {product.availability ? 'Available' : 'Out of Stock'}
                                </span>
                            </p>
                            <p>
                                <span className="font-medium">Order Range:</span> {product.minOrderQty} - {product.maxOrderQty} {product.unit}
                            </p>

                            {/* Varieties Picklist */}
                            {product.varieties?.length > 0 ? (
                                <div className="mt-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Variety:</label>
                                    <select
                                        className="border border-gray-300 rounded px-3 py-1 w-full"
                                        value={selectedVariety}
                                        onChange={(e) => setSelectedVariety(e.target.value)}
                                    >
                                        <option value="">-- Select --</option>
                                        {product.varieties.map((variety, index) => (
                                            <option key={index} value={variety}>{variety}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <p><span className="font-medium">Varieties:</span> None</p>
                            )}
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">
                                    Quantity:
                                    <input
                                        type="number"
                                        min={product.minOrderQty || 1}
                                        max={product.maxOrderQty || 100}
                                        value={quantity}
                                        onChange={(e) => handleQuantityChange(e.target.value)}
                                        className={`ml-2 border ${quantityError ? 'border-red-500' : 'border-gray-300'} rounded px-2 py-1 w-24`}
                                    />
                                </label>
                                {quantityError && (
                                    <p className="text-red-500 text-xs mt-1">{quantityError}</p>
                                )}
                            </div>


                            {(role !== 'farmer' && role !== 'transporter') && <button
                                onClick={handleAddToCart}
                                disabled={!product.availability || adding || (product.varieties?.length > 0 && !selectedVariety) || quantityError}
                                className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-4 rounded ${!product.availability || adding || (product.varieties?.length > 0 && !selectedVariety) || quantityError
                                    ? 'opacity-60 cursor-not-allowed'
                                    : ''
                                    }`}
                            >
                                {adding ? 'Adding...' : 'Add to Cart'}
                            </button>
                            }
                        </div>
                    </div>

                    <div>{farmerInfo}</div>
                </div>
            </div>
            {product && <RelatedFarmerProducts farmer={product.farmer} />}

        </div >
    );
};

export default ProductDetail;