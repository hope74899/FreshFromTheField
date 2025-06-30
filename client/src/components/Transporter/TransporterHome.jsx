/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import baseURL from "../../baseurl";
import { useAuth } from "../../auth/AuthToken";
import LoadingSpinner from "../Common/LoadingSpinner";
import { FaTruck, FaCheckCircle, FaTimesCircle, FaStar, FaClock } from "react-icons/fa";

// --- DashboardCard Component ---
const themeStyles = {
    green: {
        bg: "bg-green-50",
        border: "border-green-400",
        iconBg: "bg-green-100",
        iconText: "text-green-600",
        countText: "text-green-800",
    },
    blue: {
        bg: "bg-blue-50",
        border: "border-blue-400",
        iconBg: "bg-blue-100",
        iconText: "text-blue-600",
        countText: "text-blue-800",
    },
    red: {
        bg: "bg-red-50",
        border: "border-red-400",
        iconBg: "bg-red-100",
        iconText: "text-red-600",
        countText: "text-red-800",
    },
    yellow: {
        bg: "bg-yellow-50",
        border: "border-yellow-400",
        iconBg: "bg-yellow-100",
        iconText: "text-yellow-600",
        countText: "text-yellow-800",
    },
    purple: {
        bg: "bg-purple-50",
        border: "border-purple-400",
        iconBg: "bg-purple-100",
        iconText: "text-purple-600",
        countText: "text-purple-800",
    },
    orange: {
        bg: "bg-orange-50",
        border: "border-orange-400",
        iconBg: "bg-orange-100",
        iconText: "text-orange-600",
        countText: "text-orange-800",
    },
    gray: {
        bg: "bg-gray-50",
        border: "border-gray-400",
        iconBg: "bg-gray-100",
        iconText: "text-gray-600",
        countText: "text-gray-800",
    },
};

const DashboardCard = ({ title, count, icon: Icon, theme = "gray" }) => {
    const styles = themeStyles[theme] || themeStyles.gray;
    return (
        // Removed extra spaces from className
        <div
            className={`${styles.bg} border-l-4 ${styles.border} rounded-r-lg shadow-md hover:shadow-lg p-5 flex items-center space-x-4 transition duration-200 ease-in-out transform hover:-translate-y-1`}
        >
            {Icon && (
                // Removed extra spaces from className
                <div className={`p-3 rounded-full ${styles.iconBg}`}>
                    {/* Removed extra spaces from className */}
                    <Icon className={`w-6 h-6 ${styles.iconText}`} />
                </div>
            )}
            <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {title}
                </h3>
                {/* Removed extra spaces from className */}
                <p className={`text-3xl font-bold ${styles.countText}`}>{count}</p>
            </div>
        </div>
    );
};
// --- End DashboardCard Component ---

const TransporterHome = () => {
    const { user } = useAuth();
    const transporterId = user?._id;
    const [vehiclesDetails, setVehiclesDetails] = useState({});
    const [vehicles, setVehicles] = useState([]);
    const [recentVehicles, setRecentVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransporterAndVehicles = async () => {
            if (!transporterId) {
                setError("Transporter ID not found. Cannot load data.");
                setLoading(false);
                return;
            }

            // Reset state before fetching
            setLoading(true);
            setError(null);
            setVehiclesDetails({});
            setVehicles([]);
            setRecentVehicles([]);

            try {
                // Fetch vehicle details - Removed extra space in URL
                const detailsResponse = await axios.get(
                    `${baseURL}/api/vehicles/${transporterId}/details`
                );
                if (detailsResponse.status === 200) {
                    setVehiclesDetails(detailsResponse.data.vehiclesDetails || {});
                } else {
                    throw new Error(
                        `Server responded with status: ${detailsResponse.status}`
                    );
                }

                // Fetch all vehicles
                const vehiclesResponse = await axios.get(
                    `${baseURL}/api/vehicles/${transporterId}`
                );
                if (vehiclesResponse.status === 200) {
                    const allVehicles = vehiclesResponse.data.vehicles || [];
                    setVehicles(allVehicles);

                    // Filter vehicles from the last month
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

                    const filteredRecentVehicles = allVehicles
                        .filter((vehicle) => {
                            const vehicleDate = new Date(vehicle.createdAt);
                            return vehicleDate >= oneMonthAgo;
                        })
                        .sort(
                            (a, b) =>
                                new Date(b.createdAt) - new Date(a.createdAt)
                        );

                    setRecentVehicles(filteredRecentVehicles);
                } else {
                    throw new Error(
                        `Server responded with status: ${vehiclesResponse.status}`
                    );
                }
            } catch (err) {
                setError("Failed to load dashboard data. Please try again later.");
                console.error("Error fetching transporter dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (transporterId) {
            fetchTransporterAndVehicles();
        }
    }, [transporterId]);

    // Display loading spinner
    if (loading) return <LoadingSpinner />;

    // Display error message
    if (error)
        return (
            <div className="text-center text-red-500 font-semibold mt-10 p-4 bg-red-50 rounded border border-red-200">
                {error}
            </div>
        );

    // Destructure details from API response
    const {
        TotalCount = 0,
        approvedCount = 0,
        bestVehicleCount = 0,
        latestCount = 0,
    } = vehiclesDetails;

    const notApprovedCount = TotalCount - approvedCount;

    return (
        <div className="px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-3">
                Welcome, {user.firstName}!
            </h1>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 mb-8">
                <DashboardCard
                    title="Total Vehicles"
                    count={TotalCount}
                    icon={FaTruck}
                    theme="blue"
                />
                <DashboardCard
                    title="Approved"
                    count={approvedCount}
                    icon={FaCheckCircle}
                    theme="green"
                />
                <DashboardCard
                    title="Pending/Not Approved"
                    count={notApprovedCount < 0 ? 0 : notApprovedCount}
                    icon={FaTimesCircle}
                    theme="red"
                />
                <DashboardCard
                    title="Best Vehicles"
                    count={bestVehicleCount}
                    icon={FaStar}
                    theme="yellow"
                />
                <DashboardCard
                    title="Recently Added"
                    count={latestCount}
                    icon={FaClock}
                    theme="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Section 1: Recent Vehicles List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                        Recent Vehicles (Last Month)
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {recentVehicles.length > 0 ? (
                            recentVehicles.map((vehicle) => (
                                <div
                                    key={vehicle._id}
                                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-2 rounded"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {vehicle.vehicleType}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Added: {new Date(vehicle.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${vehicle.approved
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {vehicle.approved ? "Approved" : "Pending"}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">
                                No vehicles added in the last month.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransporterHome;