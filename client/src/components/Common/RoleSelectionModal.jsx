/* eslint-disable react/prop-types */

const RoleSelectionModal = ({ onSelectRole }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Select Your Role
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Please select the role that best describes you. This will help us
              tailor your experience on FreshFromTheField.
            </p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={() => onSelectRole('farmer')}
            >
              Farmer
            </button>
            <button
              className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-4"
              onClick={() => onSelectRole('buyer')}
            >
              Buyer
            </button>
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 ml-4"
              onClick={() => onSelectRole('transporter')}
            >
              Transporter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;