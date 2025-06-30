/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import axios from 'axios';
import baseURL from '../../baseurl'; // Adjust path if needed
import { useAuth } from '../../auth/AuthToken'; // Adjust path if needed
import LoadingSpinner from '../Common/LoadingSpinner'; // Adjust path if needed
import { FaBoxes, FaCheckCircle, FaTimesCircle, FaStar, FaClock, FaShoppingCart, FaChartLine, FaLeaf, FaUsers, FaUserShield, FaTractor, FaUserTie, FaUserTag } from 'react-icons/fa'; // Added more icons

// --- Chart.js Setup ---
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);
// --- End Chart.js Setup ---

// --- DashboardCard Component (Keep as is) ---
const themeStyles = {
    green: { bg: 'bg-green-50', border: 'border-green-400', iconBg: 'bg-green-100', iconText: 'text-green-600', countText: 'text-green-800' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-400', iconBg: 'bg-blue-100', iconText: 'text-blue-600', countText: 'text-blue-800' },
    red: { bg: 'bg-red-50', border: 'border-red-400', iconBg: 'bg-red-100', iconText: 'text-red-600', countText: 'text-red-800' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-400', iconBg: 'bg-yellow-100', iconText: 'text-yellow-600', countText: 'text-yellow-800' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-400', iconBg: 'bg-purple-100', iconText: 'text-purple-600', countText: 'text-purple-800' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-400', iconBg: 'bg-orange-100', iconText: 'text-orange-600', countText: 'text-orange-800' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-400', iconBg: 'bg-teal-100', iconText: 'text-teal-600', countText: 'text-teal-800' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-400', iconBg: 'bg-gray-100', iconText: 'text-gray-600', countText: 'text-gray-800' },
};

const DashboardCard = ({ title, count, icon: Icon, theme = 'gray' }) => {
    const styles = themeStyles[theme] || themeStyles.gray;
    return (
        <div className={` ${styles.bg} border-l-4 ${styles.border} rounded-r-lg shadow-md hover:shadow-lg p-4 md:p-5 flex items-center space-x-3 transition duration-200 ease-in-out transform hover:-translate-y-1 `}>
            {Icon && (<div className={`p-2 md:p-3 rounded-full ${styles.iconBg}`}> <Icon className={`w-5 h-5 md:w-6 md:h-6 ${styles.iconText}`} /> </div>)}
            <div>
                <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider"> {title} </h3>
                <p className={`text-2xl md:text-3xl font-bold ${styles.countText}`}> {count} </p>
            </div>
        </div>
    );
};
// --- End DashboardCard Component ---

// --- AdminHome Component ---
const AdminHome = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState({});
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- DUMMY DATA (Keep for fallback/testing) ---
    const useDummyData = false; // Set to false to use API
    const dummyStats = { totalProducts: 150, approvedProducts: 125, totalUsers: 85, adminUsers: 2, farmerUsers: 50, transporterUsers: 13, buyerUsers: 20 };
    const dummyRecentProductsData = [{ _id: 'prod1', name: 'Organic Spinach', status: 'Approved', date: '2024-04-02', farmerName: 'Green Farms' }, { _id: 'prod2', name: 'Heirloom Tomatoes', status: 'Pending', date: '2024-04-01', farmerName: 'Sun Valley' }, { _id: 'prod3', name: 'Fresh Basil', status: 'Approved', date: '2024-03-30', farmerName: 'Herb Gardens' }, { _id: 'prod4', name: 'Sweet Corn', status: 'Approved', date: '2024-03-28', farmerName: 'Green Farms' }, { _id: 'prod5', name: 'Red Bell Peppers', status: 'Approved', date: '2024-04-03', farmerName: 'Sun Valley' },];
    // --- END DUMMY DATA ---

    useEffect(() => {
        // --- Fetching Logic (Keep as is) ---
        if (useDummyData) {
            setStats(dummyStats);
            setRecentProducts(dummyRecentProductsData);
            setLoading(false);
            return;
        }
        const fetchAdminDashboardData = async () => {
            setLoading(true);
            setError(null);
            setStats({});
            setRecentProducts([]);

            if (!token) {
                setError("Authentication token not found. Cannot load dashboard.");
                setLoading(false);
                return;
            }

            try {
                const statsResponse = await axios.get(`${baseURL}/api/admin/dashboard/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const productsResponse = await axios.get(`${baseURL}/api/admin/products/recent?limit=7`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (statsResponse.status === 200 && productsResponse.status === 200) {
                    setStats(statsResponse.data.stats || {}); // Default to empty object
                    setRecentProducts(productsResponse.data.products || []); // Default to empty array
                } else {
                    throw new Error(`Failed to fetch data. Stats: ${statsResponse.status}, Products: ${productsResponse.status}`);
                }
            } catch (err) {
                console.error("Error fetching admin dashboard data:", err);
                setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchAdminDashboardData();
    }, [token, useDummyData]);

    // --- Prepare Chart Data with "FreshFromTheField" Palette ---
    const {
        totalProducts = 0,
        approvedProducts = 0,
        totalUsers = 0,
        adminUsers = 0,
        farmerUsers = 0,
        transporterUsers = 0,
        buyerUsers = 0,
    } = stats;

    const pendingProducts = totalProducts - approvedProducts;

    // -- Define Palette Colors --
    const freshGreen = '#2E7D32';    // green-700
    const warmYellow = '#F9A825';    // yellow-600
    const earthyBrown = '#57534e';   // stone-600 (approx)
    const deepBlue = '#1565C0';      // blue-700
    const textColor = '#374151';     // gray-700 (for labels)
    const gridColor = '#E5E7EB';     // gray-200 (for grid lines)
    const borderColor = '#F9FAFB';   // gray-50 or white (for segment borders)

    // -- Product Status Chart (Doughnut) - Using Palette --
    const productChartData = {
        labels: ['Approved', 'Pending/Other'],
        datasets: [
            {
                label: '# of Products',
                data: [approvedProducts, pendingProducts < 0 ? 0 : pendingProducts],
                backgroundColor: [
                    freshGreen, // Approved = Fresh Green
                    warmYellow, // Pending = Warm Yellow
                ],
                borderColor: borderColor, // Use light border for contrast
                borderWidth: 2,
                hoverOffset: 4,
                hoverBorderColor: borderColor, // Keep border color consistent on hover
                hoverBackgroundColor: [ // Slightly darken on hover
                    '#1a5d23', // Darker green
                    '#c7861a' // Darker yellow
                ]
            },
        ],
    };
    const productChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: textColor, // Use defined text color
                    padding: 15,
                    font: { size: 12 } // Adjust font size if needed
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)', // Dark tooltip
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                boxPadding: 4, // Add some padding inside tooltip
                callbacks: { // Example: Add percentage to tooltip
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
                            label += context.parsed + ` (${percentage}%)`;
                        }
                        return label;
                    }
                }
            },
            title: { display: false },
        },
        cutout: '65%', // Adjust doughnut thickness
    };

    // -- User Roles Chart (Bar) - Using Palette --
    const userChartData = {
        labels: ['Admin', 'Farmers', 'Transporters', 'Buyers'],
        datasets: [
            {
                label: 'User Count',
                data: [adminUsers, farmerUsers, transporterUsers, buyerUsers],
                backgroundColor: [
                    deepBlue,    // Admin = Deep Blue
                    freshGreen,  // Farmers = Fresh Green
                    earthyBrown, // Transporters = Earthy Brown
                    warmYellow,  // Buyers = Warm Yellow
                ],
                borderColor: [ // Optional: Use slightly darker shades or remove
                    '#0d47a1', // Darker blue
                    '#1a5d23', // Darker green
                    '#3f3a37', // Darker stone
                    '#c7861a', // Darker yellow
                ],
                borderWidth: 0, // Set to 0 to rely only on backgroundColor
                borderRadius: 4,
                barThickness: 'flex',
                maxBarThickness: 35, // Adjust max thickness
                hoverBackgroundColor: [ // Darken on hover
                    '#0d47a1', // Darker blue
                    '#1a5d23', // Darker green
                    '#3f3a37', // Darker stone
                    '#c7861a', // Darker yellow
                ],
            },
        ],
    };
    const userChartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
                grid: { color: gridColor }, // Use defined grid color
                ticks: {
                    stepSize: Math.max(1, Math.ceil(Math.max(adminUsers, farmerUsers, transporterUsers, buyerUsers) / 5)),
                    precision: 0,
                    color: textColor, // Use defined text color
                    font: { size: 11 } // Adjust font size
                }
            },
            y: {
                grid: { display: false },
                ticks: {
                    color: textColor, // Use defined text color
                    font: { size: 12 } // Adjust font size
                }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                boxPadding: 4,
            },
            title: { display: false },
        },
    };
    // --- End Chart Data Prep ---


    // --- Render Logic ---
    if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    if (error) return <div className="text-center text-red-500 font-semibold mt-10 p-4 bg-red-50 rounded border border-red-200 max-w-xl mx-auto">{error}</div>;

    // Use the bg-gray-100 for the main background as per palette
    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-100 min-h-screen"> {/* Changed background */}
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6 border-b border-gray-300 pb-3"> {/* Use gray-700 for text */}
                Admin Dashboard
            </h1>

            {/* Stats Cards Section - Update themes to match palette logic if needed, or keep as is */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3  xl:grid-cols-4 mb-8">
                {/* Example using palette colors - might need to adjust DashboardCard or themeStyles */}
                <DashboardCard title="Total Users" count={totalUsers} icon={FaUsers} theme="purple" /> {/* Keep existing themes or create new ones based on palette */}
                <DashboardCard title="Total Products" count={totalProducts} icon={FaBoxes} theme="green" />
                <DashboardCard title="Approved Products" count={approvedProducts} icon={FaCheckCircle} theme="blue" />
                <DashboardCard title="Pending Products" count={pendingProducts < 0 ? 0 : pendingProducts} icon={FaClock} theme="yellow" /> {/* Changed to yellow based on palette logic */}
                <DashboardCard title="Farmers" count={farmerUsers} icon={FaTractor} theme="green" /> {/* Changed to green */}
                <DashboardCard title="Transporters" count={transporterUsers} icon={FaUserTie} theme="orange" />{/* Keep orange or change to brown/stone theme */}
            </div>


            {/* Charts and Recent Products Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Column 1: Product Status Chart - Use bg-white or bg-gray-200 for card */}
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col"> {/* Used standard card style from palette */}
                    <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-700 border-b border-gray-200 pb-2">Product Status</h3>
                    <div className="flex-grow relative h-64 md:h-72">
                        {totalProducts > 0 ? (
                            <Doughnut data={productChartData} options={productChartOptions} />
                        ) : (
                            <p className="text-center text-gray-500 flex items-center justify-center h-full">No product data available.</p>
                        )}
                    </div>
                </div>

                {/* Column 2: User Roles Chart - Use bg-white or bg-gray-200 for card */}
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col"> {/* Used standard card style from palette */}
                    <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-700 border-b border-gray-200 pb-2">User Roles</h3>
                    <div className="flex-grow relative h-64 md:h-72">
                        {totalUsers > 0 ? (
                            <Bar data={userChartData} options={userChartOptions} />
                        ) : (
                            <p className="text-center text-gray-500 flex items-center justify-center h-full">No user data available.</p>
                        )}
                    </div>
                </div>

                {/* Column 3: Recent Products List - Use bg-white or bg-gray-200 for card */}
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col"> {/* Used standard card style from palette */}
                    <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-700 border-b border-gray-200 pb-2">Recent Products</h3>
                    <div className="space-y-2.5 flex-grow overflow-y-auto max-h-72 pr-2 custom-scrollbar">
                        {recentProducts.length > 0 ? (
                            recentProducts.map(product => (
                                <div key={product._id} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-1.5 rounded text-sm">
                                    <div>
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        {product.farmerName && <p className="text-xs text-gray-500">by {product.farmerName}</p>}
                                        <p className="text-xs text-gray-400">Added: {new Date(product.date).toLocaleDateString()}</p>
                                    </div>
                                    {/* Status badge can use yellow-600 for pending */}
                                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${product.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {product.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center flex items-center justify-center h-full">No recent product activity.</p>
                        )}
                    </div>
                </div>

            </div> {/* End grid */}
        </div> // End page container
    );
};

export default AdminHome;