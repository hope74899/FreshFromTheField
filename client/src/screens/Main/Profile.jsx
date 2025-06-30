import axios from 'axios';
import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthToken';
import { useNavigate } from 'react-router-dom';
import baseURL, { imageurl } from '../../baseurl';
import { pakistaniCities } from '../../assets/data';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, token, refreshUser } = useAuth(); // Assuming useAuth has a refreshUser function
  const navigate = useNavigate();
  const cities = pakistaniCities;

  const [imageFile, setImageFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [description, setDescription] = useState('');
  const [farmerPhoneNumber, setFarmerPhoneNumber] = useState('');
  const [transporterPhoneNumber, setTransporterPhoneNumber] = useState('');
  // Kept error states in case you want to map backend errors to specific fields
  const [farmerPhoneError, setFarmerPhoneError] = useState('');
  const [transporterPhoneError, setTransporterPhoneError] = useState('');
  const [error, setError] = useState('');
  const [showRoleTooltip, setShowRoleTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setRole(user.role || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setProvince(user.province || '');
      setCountry(user.country || '');
      if (user.farmerDetails) {
        setFarmName(user.farmerDetails.farmName || '');
        setFarmLocation(user.farmerDetails.farmLocation || '');
        setDescription(user.farmerDetails.description || '');
        // Ensure phone number is treated as string from the start
        setFarmerPhoneNumber(user.farmerDetails.farmerPhoneNumber || '');
      } else {
        // Reset farmer fields if not a farmer
        setFarmName('');
        setFarmLocation('');
        setDescription('');
        setFarmerPhoneNumber('');
      }
      if (user.transporterDetails) {
        setTransporterPhoneNumber(user.transporterDetails.transporterPhoneNumber || '');
      } else {
        // Reset transporter fields if not a transporter
        setTransporterPhoneNumber('');
      }
      if (user.profileImage) {
        setSelectedImage(user.profileImage);
      } else {
        setSelectedImage(null); // Ensure it's reset if no profile image
      }
    }
  }, [user]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // Show preview
      setImageFile(file); // Store file for upload
    }
  };

  // Simplified phone change handlers, only setting state
  const handleFarmerPhoneChange = (value) => {
    setFarmerPhoneNumber(value);
    if (farmerPhoneError) setFarmerPhoneError(''); // Clear previous error
  };

  const handleTransporterPhoneChange = (value) => {
    setTransporterPhoneNumber(value);
    if (transporterPhoneError) setTransporterPhoneError(''); // Clear previous error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFarmerPhoneError('');
    setTransporterPhoneError('');
    setIsLoading(true);


    if (!user) {
      setError('User not authenticated.');
      setIsLoading(false);
      return;
    }

    // Minimal client-side check (you can add more if you really want specific ones)
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      setIsLoading(false);
      return;
    }
    if (!role) {
      setError('Please select a role.');
      setIsLoading(false);
      return;
    }

    // Role specific required fields (minimal checks)
    if (role === 'farmer' && !farmerPhoneNumber.trim()) {
      setFarmerPhoneError('Farmer phone number is required.'); // Example of setting a specific field error
      setError('Please fill all required fields for your role.');
      setIsLoading(false);
      return;
    }
    if (role === 'transporter' && !transporterPhoneNumber.trim()) {
      setTransporterPhoneError('Transporter phone number is required.');
      setError('Please fill all required fields for your role.');
      setIsLoading(false);
      return;
    }


    try {
      const formData = new FormData();
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());
      formData.append('role', role); // Role is now required by above check
      formData.append('address', address.trim());
      formData.append('city', city ? city.toLowerCase() : '');
      formData.append('province', province.trim());
      formData.append('country', country.trim());

      if (imageFile) {
        formData.append('profileImage', imageFile);
      } else if (selectedImage === null && user.profileImage) {
        // If selectedImage is explicitly set to null (e.g. user wants to remove image)
        // And there was an existing profile image. Send an empty string or a specific flag.
        // This depends on how your backend handles image removal.
        // For now, we won't append if no new imageFile and selectedImage isn't explicitly cleared.
        // If you want to allow removal, you might need:
        // formData.append('removeProfileImage', 'true');
      }


      if (role === 'farmer') {
        formData.append('farmName', farmName.trim());
        formData.append('farmLocation', farmLocation.trim());
        formData.append('description', description.trim());
        formData.append('farmerPhoneNumber', farmerPhoneNumber.trim()); // Send as string
      } else if (role === 'transporter') {
        formData.append('transporterPhoneNumber', transporterPhoneNumber.trim()); // Send as string
      }
      // For 'buyer', no extra details are appended based on current logic

      const response = await axios.put(`${baseURL}/api/user/update/${user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Assuming backend sends back the updated user or at least a success flag
      if (response.data && (response.status === 200 || response.status === 201)) {
        toast.success(response.data.message || 'Profile updated successfully!')
        if (typeof refreshUser === 'function') {
          await refreshUser(); // Refresh user context data
        }
        setTimeout(() => {
          navigate('/');
        }, 3000)

      } else {
        // Handle cases where backend returns non-2xx but not an error in axios' view
        setError(response.data.message || 'Failed to update profile. Please check your input.');
      }
    } catch (err) {
      console.error("Profile update error:", err.response);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);

      } else {
        setError('An error occurred while updating your profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    if (!user?.role) { // Only allow change if role is not already set
      setRole(newRole);
      if (newRole) { // Only show alert if a role is selected
        alert("⚠️ Choose carefully – you can't update the role once your profile is saved with a role.");
      }
      // Reset role-specific fields when role changes
      if (newRole !== 'farmer') {
        setFarmName('');
        setFarmLocation('');
        setDescription('');
        setFarmerPhoneNumber('');
        setFarmerPhoneError('');
      }
      if (newRole !== 'transporter') {
        setTransporterPhoneNumber('');
        setTransporterPhoneError('');
      }
    }
  };
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto max-w-6xl p-6">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="md:flex">
            {/* Left Sidebar */}
            <div className="md:w-1/3 bg-green-700 p-8 text-white">
              <h1 className="text-2xl text-center font-bold mb-6">Profile Setup</h1>
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4 mb-8">
                  <input
                    type="file"
                    accept="image/*"
                    id="imageUpload"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div
                    className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-600 cursor-pointer group"
                    onClick={() => document.getElementById('imageUpload').click()}
                  >
                    <img
                      src={selectedImage && typeof selectedImage === 'string' && selectedImage.startsWith('blob:') ? selectedImage : (selectedImage ? `${imageurl}${selectedImage}` : '/blankProfile.png')}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      Upload
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-xl">{firstName || user?.firstName} {lastName || user?.lastName}</p>
                    <p className="text-gray-200 capitalize">{role || user?.role || 'Select your role'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 p-3 bg-green-800 rounded-lg">
                    <span className="bg-yellow-600 p-2 rounded-full text-green-800">📧</span>
                    {user?.email}
                  </p>
                  {role === 'farmer' && farmName && (
                    <p className="flex items-center gap-2 p-3 bg-green-800 rounded-lg">
                      <span className="bg-yellow-600 p-2 rounded-full text-green-800">🚜</span>
                      {farmName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Form Section */}
            <div className="md:w-2/3 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-l-4 border-stone-600 pl-4">
                  <h3 className="text-lg font-semibold text-stone-600 mb-2">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-700"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-700"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-700"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">
                        City
                      </label>
                      <select
                        id="city"
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-700"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      >
                        <option value="">Select a city</option>
                        {cities.map((cityName, index) => (
                          <option key={index} value={cityName.toLowerCase()}>
                            {cityName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="province" className="block text-gray-700 text-sm font-bold mb-2">
                        Province
                      </label>
                      <input
                        type="text"
                        id="province"
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-700"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-700"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full py-2 px-3 bg-gray-200 border border-gray-200 rounded-lg outline-none cursor-not-allowed"
                      value={user?.email || ''}
                      readOnly
                    />
                  </div>
                </div>

                <div
                  className="bg-gray-200 p-4 rounded-lg mt-6"
                  onMouseEnter={() => user?.role && setShowRoleTooltip(true)}
                  onMouseLeave={() => setShowRoleTooltip(false)}
                >
                  <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
                    Who are you? <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    className={`w-full bg-transparent py-2 px-3 text-green-700 font-medium outline-none focus:ring-2 focus:ring-green-700 ${user?.role ? 'pointer-events-none bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                      }`}
                    value={role}
                    onChange={handleRoleChange}
                    disabled={!!user?.role} // Disable if role is already set from backend
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="farmer">Farmer</option>
                    <option value="transporter">Transporter</option>
                    <option value="buyer">Buyer</option>
                  </select>
                  {showRoleTooltip && user?.role && (
                    <p className="text-red-500 text-sm mt-1">You can't update your role. Contact admin for changes.</p>
                  )}
                </div>

                {/* Farmer Details */}
                {role === 'farmer' && (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
                    <h3 className="text-green-700 font-semibold mb-4 text-lg flex items-center gap-2">
                      <span className="bg-yellow-600 text-white p-2 rounded-full">🚜</span>
                      Farm Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="farmName" className="block text-gray-700 text-sm font-bold mb-2">
                          Farm Name
                        </label>
                        <input
                          type="text"
                          id="farmName"
                          className="w-full py-2 px-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-700"
                          value={farmName}
                          onChange={(e) => setFarmName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="farmLocation" className="block text-gray-700 text-sm font-bold mb-2">
                          Farm Location
                        </label>
                        <input
                          type="text"
                          id="farmLocation"
                          className="w-full py-2 px-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-700"
                          value={farmLocation}
                          onChange={(e) => setFarmLocation(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="farmerPhoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel" // Use "tel" for semantics, but value is still string
                          id="farmerPhoneNumber"
                          className={`w-full py-2 px-3 border ${farmerPhoneError ? 'border-red-500 outline-none focus:ring-2 focus:ring-red-500 ' : 'border-gray-200'
                            } rounded-lg outline-none focus:ring-2 focus:ring-green-700`}
                          value={farmerPhoneNumber}
                          onChange={(e) => handleFarmerPhoneChange(e.target.value)}
                          placeholder="03001234567"
                          required
                        />
                        {farmerPhoneError && ( // Still useful for backend errors
                          <p className="text-red-500 text-sm mt-1">{farmerPhoneError}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                          Description
                        </label>
                        <textarea
                          id="description"
                          className="w-full py-2 px-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-700 h-32"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Transporter Details */}
                {role === 'transporter' && (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
                    <h3 className="text-green-700 font-semibold mb-4 text-lg flex items-center gap-2">
                      <span className="bg-yellow-600 text-white p-2 rounded-full">🚚</span>
                      Transporter Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="transporterPhoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="transporterPhoneNumber"
                          className={`w-full py-2 px-3 border ${transporterPhoneError ? 'border-red-500' : 'border-gray-200 focus:ring-2 outline-none focus:ring-green-700'
                            } rounded-lg `}
                          value={transporterPhoneNumber}
                          onChange={(e) => handleTransporterPhoneChange(e.target.value)}
                          placeholder="03001234567"
                          required
                        />
                        {transporterPhoneError && ( // Still useful for backend errors
                          <p className="text-red-500 text-sm mt-1">{transporterPhoneError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Buyer Details - placeholder */}
                {role === 'buyer' && (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
                    <h3 className="text-green-700 font-semibold mb-4 text-lg flex items-center gap-2">
                      <span className="bg-yellow-600 text-white p-2 rounded-full">🛒</span>
                      Buyer Details
                    </h3>
                    <div className="space-y-4">
                      {/* Add buyer-specific fields here if needed */}
                      <p className="text-gray-500">No additional details required for buyers at this time.</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold transition-colors shadow-lg mt-6 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </button>
                {error && <div className="text-red-500 mt-4 p-3 bg-red-100 rounded-lg">{error}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;