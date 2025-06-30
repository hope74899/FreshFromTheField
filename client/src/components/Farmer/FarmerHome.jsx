/* eslint-disable react/prop-types */
// FarmerHome.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import baseURL from '../../baseurl';
import { useAuth } from '../../auth/AuthToken';
import LoadingSpinner from '../Common/LoadingSpinner';
import { FaBoxes, FaCheckCircle, FaTimesCircle, FaStar, FaClock } from 'react-icons/fa';

// --- DashboardCard Component (unchanged) ---
const themeStyles = {
    green: { bg: 'bg-green-50', border: 'border-green-400', iconBg: 'bg-green-100', iconText: 'text-green-600', countText: 'text-green-800' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-400', iconBg: 'bg-blue-100', iconText: 'text-blue-600', countText: 'text-blue-800' },
    red: { bg: 'bg-red-50', border: 'border-red-400', iconBg: 'bg-red-100', iconText: 'text-red-600', countText: 'text-red-800' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-400', iconBg: 'bg-yellow-100', iconText: 'text-yellow-600', countText: 'text-yellow-800' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-400', iconBg: 'bg-purple-100', iconText: 'text-purple-600', countText: 'text-purple-800' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-400', iconBg: 'bg-orange-100', iconText: 'text-orange-600', countText: 'text-orange-800' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-400', iconBg: 'bg-gray-100', iconText: 'text-gray-600', countText: 'text-gray-800' },
};

const DashboardCard = ({ title, count, icon: Icon, theme = 'gray' }) => {
    const styles = themeStyles[theme] || themeStyles.gray;
    return (
        <div className={` ${styles.bg} border-l-4 ${styles.border} rounded-r-lg shadow-md hover:shadow-lg p-5 flex items-center space-x-4 transition duration-200 ease-in-out transform hover:-translate-y-1 `}>
            {Icon && (<div className={`p-3 rounded-full ${styles.iconBg}`}> <Icon className={`w-6 h-6 ${styles.iconText}`} /> </div>)}
            <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider"> {title} </h3>
                <p className={`text-3xl font-bold ${styles.countText}`}> {count} </p>
            </div>
        </div>
    );
};
// --- End DashboardCard Component ---

const FarmerHome = () => {
    const { user } = useAuth();
    const farmerId = user?._id;
    const [productsDetails, setProductsDetails] = useState({});
    const [products, setProducts] = useState([]); // State for all products
    const [recentProducts, setRecentProducts] = useState([]); // State for filtered recent products
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFarmerAndProducts = async () => {
            if (!farmerId) {
                setError("Farmer ID not found. Cannot load data.");
                setLoading(false);
                return;
            }

            // Reset state before fetching
            setLoading(true);
            setError(null);
            setProductsDetails({});
            setProducts([]);
            setRecentProducts([]);

            try {
                // Fetch product details
                const detailsResponse = await axios.get(`${baseURL}/api/farmerproducts/${farmerId}/details`);
                if (detailsResponse.status === 200) {
                    setProductsDetails(detailsResponse.data.productsDetails || {});
                } else {
                    throw new Error(`Server responded with status: ${detailsResponse.status}`);
                }

                // Fetch all products
                const productsResponse = await axios.get(`${baseURL}/api/farmerproducts/${farmerId}`);
                if (productsResponse.status === 200) {
                    const allProducts = productsResponse.data.products || [];
                    setProducts(allProducts);

                    // Filter products from the last month
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); // Set date to one month ago

                    const filteredRecentProducts = allProducts
                        .filter(product => {
                            const productDate = new Date(product.createdAt || product.date); // Use createdAt or date field
                            return productDate >= oneMonthAgo;
                        })
                        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)); // Sort by date, newest first

                    setRecentProducts(filteredRecentProducts);
                } else {
                    throw new Error(`Server responded with status: ${productsResponse.status}`);
                }
            } catch (err) {
                setError('Failed to load dashboard data. Please try again later.');
                console.error("Error fetching farmer dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (farmerId) {
            fetchFarmerAndProducts();
        }
    }, [farmerId]);

    // Display loading spinner
    if (loading) return <LoadingSpinner />;

    // Display error message
    if (error) return <div className="text-center text-red-500 font-semibold mt-10 p-4 bg-red-50 rounded border border-red-200">{error}</div>;

    // Destructure details from API response
    const {
        TotalCount = 0,
        approvedCount = 0,
        bestProductCount = 0,
        latestCount = 0,
    } = productsDetails;

    const notApprovedCount = TotalCount - approvedCount;

    return (
        <div className="px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-3">
                Welcome, {user.firstName}!
            </h1>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 mb-8">
                <DashboardCard title="Total Products" count={TotalCount} icon={FaBoxes} theme="green" />
                <DashboardCard title="Approved" count={approvedCount} icon={FaCheckCircle} theme="blue" />
                <DashboardCard title="Pending/Not Approved" count={notApprovedCount < 0 ? 0 : notApprovedCount} icon={FaTimesCircle} theme="red" />
                <DashboardCard title="Best Selling" count={bestProductCount} icon={FaStar} theme="yellow" />
                <DashboardCard title="Recently Added" count={latestCount} icon={FaClock} theme="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Section 1: Recent Products List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Recent Products (Last Month)</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {recentProducts.length > 0 ? (
                            recentProducts.map(product => (
                                <div key={product._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-2 rounded">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-500">
                                            Added: {new Date(product.createdAt || product.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${product.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {product.approved ? 'Approved' : 'Pending'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No products added in the last month.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerHome;