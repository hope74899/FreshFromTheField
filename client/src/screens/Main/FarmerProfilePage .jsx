import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaMapMarkerAlt } from 'react-icons/fa';
import baseURL, { imageurl } from '../../baseurl';
import ProductCard from '../../components/Buyer/ProductCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const FarmerProfilePage = () => {
    const { id } = useParams(); // Farmer ID from the URL
    const [farmer, setFarmer] = useState({});
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFarmerAndProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch Farmer Data
            const productsResponse = await axios.get(`${baseURL}/api/farmerproducts/${id}`);
            if (productsResponse.status === 200) {
                // console.log(productsResponse.data.products);
                console.log(productsResponse.data.farmer);
                setProducts(productsResponse.data.products);
                setFarmer(productsResponse.data.farmer)
            }

        } catch (err) {
            setError('Failed to load farmer profile. Please check your network connection.');
            console.error("Error fetching farmer profile:", err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchFarmerAndProducts();
    }, [id]);
    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        return <div className="text-center text-red-500 font-semibold mt-10">{error}</div>;
    }

    if (!farmer) {
        return <div className="text-center text-red-500 font-semibold mt-10">Farmer not found</div>;
    }

    return (
        <div className="w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="md:flex md:space-x-6">

                {/* Sidebar (Farmer Information) */}
                <div className="md:w-1/5 h-screen mb-6 md:mb-0">
                    <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <img
                                // src={`${imageurl}${farmer.profileImage}`}
                                src={farmer.profileImage ? `${imageurl}${farmer.profileImage}` : '/blankProfile.png'}
                                alt={`${farmer.firstName} ${farmer.lastName}`}
                                className="w-16 h-16 rounded-full object-cover border"
                            />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{farmer.firstName} {farmer.lastName}</h2>
                                <p className="text-gray-600 text-sm flex items-center gap-1">
                                    <FaMapMarkerAlt className="text-yellow-400" /> {farmer.farmerDetails?.farmLocation || "Location not available"}
                                </p>
                            </div>
                        </div>
                        <div className="text-gray-700 text-sm">
                            <p><strong>Farm Name:</strong> {farmer.farmerDetails?.farmName || "N/A"}</p>
                            <p><strong>Email:</strong> {farmer.email || "N/A"}</p>
                            <p><strong>Phone:</strong> {farmer.phone || "N/A"}</p>
                            <p><strong>Address:</strong> {farmer.address}, {farmer.city}, {farmer.province}, {farmer.country}</p>
                            <p className="mt-2"><strong>Description:</strong> {farmer.description}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content (Products Grid) */}
                <div className="md:w-4/5">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Products by {farmer.firstName}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.length > 0 ? (
                            products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        ) : (
                            <p className="text-gray-500">No products available from this farmer.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FarmerProfilePage;