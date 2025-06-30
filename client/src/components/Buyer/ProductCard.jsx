/* eslint-disable react/prop-types */
import { imageurl } from '../../baseurl';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaRupeeSign } from "react-icons/fa6";
// import { useNavigation } from 'react-router-dom';

const ProductCard = ({ product }) => {
    // console.log('product.farmer.profileImage', product.farmer.profileImage)
    // const navigate = useNavigation();
    return (
        <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-100"> {/* General Card Styling */}
            {/* Product Image */}
            <img
                src={`${imageurl}${product.images[0]?.filename}`}
                alt={product.name}
                className="w-full h-40 object-cover object-center"   // Reduced image height
            />

            {/* Product Details */}
            <div className="p-3">   {/* Reduced padding */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 font-serif">{product.name}</h3>  {/* Product Name Styling */}
                    <div className="flex items-center space-x-1">
                        <FaRupeeSign className="text-gray-500" />
                        <span className="text-gray-800 font-semibold">{product.price}</span>
                        <span className="text-gray-500 text-xs">/{product.unit}</span>
                    </div>
                </div>
                <p className="text-gray-600 text-xs mt-1">
                    Min Order: {product.minOrderQty || 1} {product.unit}
                </p>
                <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                    {product.description}
                </p>
            </div>

            {/* Farmer Details */}
            {product.farmer && (
                <div className="px-2 py-1 bg-gray-50 border-t border-gray-100">  {/* Reduced padding, same background as card */}
                    <div className="flex items-center space-x-2">
                        <img
                            src={product.farmer.profileImage
                                ? `${imageurl}${product.farmer.profileImage}`
                                : '/blankProfile.png'}
                            alt={product.farmer.firstName}
                            className="w-6 h-6 rounded-full object-cover"  // Further reduced image size
                        />
                        <div>
                            <p className="text-gray-800 text-xs font-medium">{product.farmer.firstName} {product.farmer.lastName}</p> {/* Reduced font size */}
                            <p className="text-stone-600 text-xs flex items-center gap-1"> {/* Reduced font size */}
                                <FaMapMarkerAlt className="inline-block mr-1 text-yellow-400" /> {/* Icon color adjusted */}
                                {product.farmer.farmerDetails.farmLocation}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Availability & Button */}
            <div className="p-3 flex items-center justify-between"> {/*Reduced padding */}
                <p
                    className={`text-xs font-bold ${product.availability ? "bg-green-600 text-white" : "bg-red-600 text-white"
                        } px-2 py-1 rounded-full`}  /* Availability text styling */
                >
                    {product.availability ? "Available" : "Out of Stock"}
                </p>
                <button
                    onClick={() => window.location.href = `/productdetail/${product._id}`}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md transition duration-200 text-sm" /* Button styling */
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default ProductCard;