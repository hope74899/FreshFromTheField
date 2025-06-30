import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthToken';
import baseURL from '../../baseurl';
import LoadingSpinner from '../Common/LoadingSpinner';
import Vehicle from './Vehicle';

const TransporterVehicles = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const [transporter, setTransporter] = useState({});
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransporterAndVehicles = async () => {
        if (!token) {
            setError('Please log in to view transporter vehicles.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseURL}/api/vehicles/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                setTransporter(response.data.transporter);
                setVehicles(response.data.vehicles);
            } else {
                setError('Failed to load transporter profile.');
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to load transporter profile. Please check your network connection.'
            );
            console.error('Error fetching transporter vehicles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && token) {
            fetchTransporterAndVehicles();
        }
    }, [id, token]);

    const onVehicleDelete = () => {
        fetchTransporterAndVehicles();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <LoadingSpinner className="text-green-700" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-700 font-semibold mt-10 bg-gray-100 min-h-screen">
                {error}
            </div>
        );
    }

    if (!transporter) {
        return (
            <div className="text-center text-red-700 font-semibold mt-10 bg-gray-100 min-h-screen">
                Transporter not found
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-green-700 mb-4">
                    Vehicles by {transporter.firstName} {transporter.lastName}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {vehicles.length > 0 ? (
                        vehicles.map((vehicle) => (
                            <Vehicle
                                key={vehicle._id}
                                vehicle={vehicle}
                                onVehicleDelete={onVehicleDelete}
                            />
                        ))
                    ) : (
                        <p className="text-gray-600 text-center col-span-full">
                            No vehicles available from this transporter.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransporterVehicles;