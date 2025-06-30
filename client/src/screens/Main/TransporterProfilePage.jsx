import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import baseURL, { imageurl } from "../../baseurl";
import TransporterVehicleCard from "../../components/Transporter/TransporterVehicleCard";

const TransporterProfilePage = () => {
    const { id } = useParams(); // Transporter ID from the URL
    const [transporter, setTransporter] = useState({});
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransporterAndVehicles = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch Transporter Data and Vehicles
            const vehiclesResponse = await axios.get(`${baseURL}/api/vehicles/${id}`);
            if (vehiclesResponse.status === 200) {
                console.log(vehiclesResponse.data.vehicles);
                console.log(vehiclesResponse.data.transporter);
                setVehicles(vehiclesResponse.data.vehicles);
                setTransporter(vehiclesResponse.data.transporter);
            }
        } catch (err) {
            setError(
                "Failed to load transporter profile. Please check your network connection."
            );
            console.error("Error fetching transporter profile:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransporterAndVehicles();
    }, [id]);

    if (loading) {
        return <div className="text-center">Loading transporter profile...</div>;
    }

    if (error) {
        return (
            <div className="text-center text-red-500 font-semibold mt-10">{error}</div>
        );
    }

    if (!transporter) {
        return (
            <div className="text-center text-red-500 font-semibold mt-10">
                Transporter not found
            </div>
        );
    }

    return (
        <div className="w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="md:flex md:space-x-6">
                {/* Sidebar (Transporter Information) */}
                <div className="md:w-1/5 h-screen mb-6 md:mb-0">
                    <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <img
                                src={transporter.profileImage ? `${imageurl}${transporter.profileImage}` : '/blankProfile.png'}
                                alt={`${transporter.firstName} ${transporter.lastName} `}
                                className="w-16 h-16 rounded-full object-cover border"
                            />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {transporter.firstName} {transporter.lastName}
                                </h2>
                                <p className="text-gray-600 text-sm flex items-center gap-1">
                                    <FaMapMarkerAlt className="text-yellow-400" />{" "}
                                    {transporter.city || "Location not available"}
                                </p>
                            </div>
                        </div>
                        <div className="text-gray-700 text-sm">
                            <p>
                                <strong>Email:</strong> {transporter.email || "N/A"}
                            </p>
                            <p>
                                <strong>Address:</strong>{" "}
                                {`${transporter.address || ""} ${transporter.city || ""} ${transporter.province || ""
                                    } ${transporter.country || ""} `.trim() || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content (Vehicles Grid) */}
                <div className="md:w-4/5">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Vehicles by {transporter.firstName}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {vehicles.length > 0 ? (
                            vehicles.map((vehicle) => (
                                <TransporterVehicleCard key={vehicle._id} vehicle={vehicle} />
                            ))
                        ) : (
                            <p className="text-gray-500">
                                No vehicles available from this transporter.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransporterProfilePage;