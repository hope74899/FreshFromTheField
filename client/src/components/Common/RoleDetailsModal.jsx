import React, { useState, useEffect } from 'react';

const RoleDetailsModal = ({ role, onComplete }) => {
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Reset state when the role changes (very important)
    useEffect(() => {
      setFarmName('');
      setFarmLocation('');
      setVehicleType('');
      setDeliveryAddress('');
    }, [role]);

  const handleSubmit = (e) => {
    e.preventDefault();

    let roleDetails = {};

    if (role === 'farmer') {
      if (!farmName || !farmLocation) {
        alert('Farm Name and Farm Location are required for farmers.');
        return;
      }
      roleDetails = { farmName, farmLocation };
    } else if (role === 'transporter') {
      if (!vehicleType) {
        alert('Vehicle Type is required for transporters.');
        return;
      }
      roleDetails = { vehicleType };
    } else if (role === 'buyer') {
      if (!deliveryAddress) {
        alert('Delivery Address is required for buyers.');
        return;
      }
      roleDetails = { deliveryAddress };
    }

    onComplete(roleDetails);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {`Enter Your ${role === 'farmer'
              ? 'Farm'
              : role === 'transporter'
                ? 'Transport'
                : 'Buyer'
            } Details`}
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Please provide the following details specific to your role.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="px-4 py-3">
            {role === 'farmer' && (
              <>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="farmName"
                  >
                    Farm Name
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="farmName"
                    type="text"
                    placeholder="Farm Name"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="farmLocation"
                  >
                    Farm Location
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="farmLocation"
                    type="text"
                    placeholder="Farm Location"
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {role === 'transporter' && (
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="vehicleType"
                >
                  Vehicle Type
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="vehicleType"
                  type="text"
                  placeholder="Vehicle Type"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  required
                />
              </div>
            )}

            {role === 'buyer' && (
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="deliveryAddress"
                >
                  Delivery Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="deliveryAddress"
                  type="text"
                  placeholder="Delivery Address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Complete
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailsModal;