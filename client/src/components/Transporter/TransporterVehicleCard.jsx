/* eslint-disable react/prop-types */
import { imageurl } from '../../baseurl';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaWeightHanging } from 'react-icons/fa';

const TransporterVehicleCard = ({ vehicle }) => {
  return (
    <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-100">
      {/* Vehicle Image */}
      <img
        src={`${imageurl}${vehicle?.images[0]?.filename}`}
        alt={vehicle.vehicleType}
        className="w-full h-40 object-cover object-center"
      />

      {/* Vehicle Details */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 font-serif">
            {vehicle.vehicleType}
          </h3>
          <div className="flex items-center space-x-1">
            <FaWeightHanging className="text-gray-500" />
            <span className="text-gray-800 font-semibold">
              {vehicle.vehicleCapacity}
            </span>
            <span className="text-gray-500 text-xs">KG</span>
          </div>
        </div>
        <p className="text-gray-600 text-xs mt-1">
          Reg. Number: {vehicle.registrationNumber}
        </p>
        {vehicle.bestVehicle && (
          <p className="text-yellow-600 text-xs mt-1 font-semibold">
            ★ Best Vehicle
          </p>
        )}
      </div>

      {/* Transporter Details */}
      {vehicle.transporter && (
        <div className="px-2 py-1 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <img
              // src={`${imageurl}${vehicle.transporter.profileImage}`}
              src={vehicle.transporter.profileImage
                ? `${imageurl}${vehicle.transporter.profileImage}`
                : '/blankProfile.png'}

              alt={`${vehicle.transporter.firstName}`}
              className="w-6 h-6 rounded-full object-cover"
            />
            <div>
              <p className="text-gray-800 text-xs font-medium">
                {vehicle.transporter.firstName} {vehicle.transporter.lastName}
              </p>
              <p className="text-stone-600 text-xs flex items-center gap-1">
                <FaMapMarkerAlt className="inline-block mr-1 text-yellow-400" />
                {vehicle.transporter.address?.city}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Availability & Button */}
      <div className="p-3 flex items-center justify-between">
        <p
          className={`text-xs font-bold ${vehicle.availability ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            } px-2 py-1 rounded-full`}
        >
          {vehicle.availability ? 'Available' : 'Not Available'}
        </p>
        <button
          onClick={() => (window.location.href = `/vehicledetail/${vehicle._id}`)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md transition duration-200 text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default TransporterVehicleCard;