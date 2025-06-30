import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import baseURL, { imageurl } from "../../baseurl";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaWeightHanging } from "react-icons/fa";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const VehicleDetail = () => {
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const { id } = useParams();

    const getVehicle = async () => {
        try {
            const response = await axios.get(`${baseURL}/api/vehicle/${id}`);
            if (response.status === 200) {
                const data = response.data.vehicle;
                setVehicle(data);
                setCoverImage(
                    `${imageurl}${data.images[0]?.filename}` || "/blankProfile.png"
                );
            } else {
                setError("Vehicle not found.");
            }
        } catch (err) {
            setError("Failed to load vehicle. Please check your network connection.");
            console.log(err);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    useEffect(() => {
        getVehicle();
    }, [id]);

    const handleThumbnailClick = (image) => {
        setCoverImage(image);
    };

    const [showDetails, setShowDetails] = useState(false);
    const handleViewDetailsClick = () => {
        setShowDetails(true);
    };

    const transporterInfo = useMemo(() => {
        if (!vehicle?.transporter) {
            return null;
        }

        const { transporter } = vehicle;

        return (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800">
                    Transporter Information
                </h3>
                <div className="flex items-center mt-3 space-x-3">
                    <img
                        src={transporter.profileImage ? `${imageurl}${transporter.profileImage}` : '/blankProfile.png'}
                        alt={`${transporter.firstName} ${transporter.lastName}`}
                        className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div>
                        <p className="text-gray-900 font-medium">
                            {transporter.firstName} {transporter.lastName}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                            <FaMapMarkerAlt className="text-yellow-400" />{" "}
                            {transporter.city || "Location not available"}
                        </p>
                    </div>
                </div>

                <div
                    className={`mt-3 text-gray-700 text-sm ${showDetails ? "" : "blur-md"}`}
                >
                    <p>
                        <strong className="font-medium">Address:</strong>{" "}
                        {`${transporter.address || ""} ${transporter.city || ""} ${transporter.province || ""
                            } ${transporter.country || ""}`.trim() || "N/A"}
                    </p>
                    <p>
                        <strong className="font-medium">Email:</strong>{" "}
                        {transporter.email || "N/A"}
                    </p>
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
                    <Link
                        to={`/transporterprofile/${transporter._id}`}
                        className="inline-block mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        View Profile
                    </Link>
                </div>
            </div>
        );
    }, [vehicle?.transporter, showDetails]);

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 font-semibold mt-10">{error}</div>
        );
    }

    if (!vehicle) {
        return (
            <div className="text-center text-red-500 font-semibold mt-10">
                Vehicle not found
            </div>
        );
    }

    return (
        <div className="max-w-7xl flex flex-col p-6 bg-white">
            <div className="flex flex-col md:flex-row gap-10">
                {/* Image Gallery */}
                <div className="flex flex-col w-full sm:w-full md:w-1/2 gap-5">
                    {/* Cover Image */}
                    <div className="w-full h-96 aspect-w-4 aspect-h-3">
                        <img
                            src={coverImage}
                            alt={vehicle.vehicleType}
                            className="w-full h-full object-cover rounded-lg shadow-md"
                            onError={(e) => {
                                e.target.src = "/blankProfile.png";
                            }}
                        />
                    </div>

                    {/* Thumbnail Slider */}
                    <div className="mt-2 relative">
                        <div className="flex justify-center items-center overflow-x-auto space-x-2 scrollbar-hide">
                            {vehicle.images.map((image, index) => (
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

                {/* Vehicle Details */}
                <div className="flex flex-col w-full sm:w-full md:w-1/2">
                    <div className="mt-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {vehicle.vehicleType}
                            </h2>
                            <div className="flex items-center mt-2 space-x-2">
                                <FaWeightHanging className="text-gray-500" />
                                <span className="text-xl font-semibold text-gray-900">
                                    {vehicle.vehicleCapacity}
                                </span>
                                <span className="text-gray-600 text-sm">KG</span>
                            </div>
                        </div>
                        <div className="mt-2 text-gray-700 text-sm">
                            <p>
                                <strong>Registration Number:</strong>{" "}
                                {vehicle.registrationNumber}
                            </p>
                            <p>
                                <strong>Availability:</strong>{" "}
                                {vehicle.availability ? "Available" : "Not Available"}
                            </p>
                            {vehicle.bestVehicle && <p>
                                <strong>Best Vehicle:</strong>{" "}
                                {vehicle.bestVehicle}
                            </p>}
                        </div>
                    </div>
                    <div>{transporterInfo}</div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetail;