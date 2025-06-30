import { useEffect, useState } from 'react';
import axios from 'axios';
import baseURL from '../../baseurl';
import { useAuth } from '../../auth/AuthToken';
import LoadingSpinner from '../Common/LoadingSpinner';
import VehicleCard from './VehicleCard';

const BestVehicles = () => {
    const { id } = useAuth();
    // console.log(id);
    const [transporter, setTransporter] = useState({});
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransporterAndVehicles = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch Transporter Data
            const vehiclesResponse = await axios.get(`${baseURL}/api/vehicles/${id}`);
            if (vehiclesResponse.status === 200) {
                const data = vehiclesResponse.data.vehicles;
                const bestVehicles = data.filter(vehicle => vehicle.bestVehicle === true);
                setVehicles(bestVehicles);
                setTransporter(vehiclesResponse.data.transporter);
            }
        } catch (err) {
            setError('Failed to load transporter profile. Please check your network connection.');
            console.error("Error fetching transporter profile:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchTransporterAndVehicles();
        }
    }, [id]);

    const onVehicleDelete = () => {
        // console.log('vehicle is being deleted');
        fetchTransporterAndVehicles();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-center text-red-500 font-semibold mt-10">{error}</div>;
    }

    if (!transporter) {
        return <div className="text-center text-red-500 font-semibold mt-10">Transporter not found</div>;
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Vehicles by {transporter.firstName}</h2>
            <div className="grid grid-cols-1 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
                {vehicles.length > 0 ? (
                    vehicles.map(vehicle => (
                        <VehicleCard key={vehicle._id} vehicle={vehicle} onVehicleDelete={onVehicleDelete} />
                    ))
                ) : (
                    <p className="text-gray-500">No vehicles available for best selection.</p>
                )}
            </div>
        </div>
    );
};

export default BestVehicles;