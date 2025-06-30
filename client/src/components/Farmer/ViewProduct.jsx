
import { useEffect, useState } from 'react';
import axios from 'axios';
import baseURL from '../../baseurl';
import { useAuth } from '../../auth/AuthToken';
import LoadingSpinner from '../Common/LoadingSpinner';
import Product from './Product';

const ViewProduct = () => {
    const { id } = useAuth();
    // console.log(id)
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
                // console.log(productsResponse.data.farmer);
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
        if (id) {
            fetchFarmerAndProducts();
        }
    }, [id]);
    const onProductDelete = () => {
        // console.log('items is being deleted')
        fetchFarmerAndProducts();
    }
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
        <div className=" px-4 py-6 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Products by {farmer.firstName}</h2>
            <div className="grid grid-cols-1 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
                {products.length > 0 ? (
                    products.map(product => (
                        <Product key={product._id} product={product} onProductDelete={onProductDelete} />
                    ))
                ) : (
                    <p className="text-gray-500">No products available from this farmer.</p>
                )}
            </div>
        </div>
    );
};

export default ViewProduct;