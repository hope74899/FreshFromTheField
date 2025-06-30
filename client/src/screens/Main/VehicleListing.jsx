import { useEffect, useState } from "react";
import axios from "axios";
import TransporterVehicleCard from "../../components/Transporter/TransporterVehicleCard";
import baseURL from "../../baseurl";
import ReactPaginate from "react-paginate";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import { useAuth } from "../../auth/AuthToken";
import { pakistaniCities } from "../../assets/data";

// Normalize pakistaniCities to lowercase to match User.city
const normalizedCities = pakistaniCities.map(city => city.toLowerCase());

const VehicleListing = () => {
    const { setAllVehicles } = useAuth();
    const [vehicleType, setVehicleType] = useState("all");
    const [city, setCity] = useState("all");
    const [sortBy, setSortBy] = useState("default");
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const limit = 8;
    const [searchTerm] = useDebounce(searchText, 500);
    const cities = normalizedCities;

    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ["vehicles", currentPage, limit, vehicleType, city, sortBy, searchTerm],
        queryFn: async () => {
            const response = await axios.get(
                `${baseURL}/api/vehicles?page=${currentPage + 1}&limit=${limit}&vehicleType=${vehicleType}&city=${city}&sortBy=${sortBy}&searchTerm=${searchTerm}`
            );

            console.log("API Response:", response.data);
            return response.data;
        },
        keepPreviousData: true,
    });

    const handlePageChange = (selectedEvent) => {
        console.log("Selected page:", selectedEvent.selected);
        setCurrentPage(selectedEvent.selected);
    };

    useEffect(() => {
        refetch();
    }, [currentPage, vehicleType, city, sortBy, searchTerm, refetch]);

    useEffect(() => {
        if (data?.vehicles && Array.isArray(data.vehicles)) {
            setAllVehicles(data.vehicles);
        } else {
            setAllVehicles([]);
        }
    }, [data, setAllVehicles]);

    const totalPages = data?.totalPages || 0;

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(0);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-5">
            {/* Section Heading */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Available Vehicles</h2>
            </div>

            {/* Show error message if API fails */}
            {error && <p className="text-red-500 text-center mb-6">{error.message}</p>}

            {/* Filters Section */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-3 bg-white border-b border-gray-300">
                {/* Vehicle Type Filter */}
                <div className="flex items-center space-x-1">
                    <label htmlFor="vehicleType" className="text-gray-600 text-sm">
                        Vehicle Type:
                    </label>
                    <select
                        id="vehicleType"
                        className="border-b border-gray-400 bg-transparent px-2 py-1 text-sm focus:outline-none focus:border-gray-600"
                        value={vehicleType}
                        onChange={(e) => {
                            setVehicleType(e.target.value);
                            setCurrentPage(0);
                        }}
                    >
                        <option value="all">All</option>
                        <option value="Truck">Truck</option>
                        <option value="Van">Van</option>
                    </select>
                </div>

                {/* City Filter */}
                <div className="flex items-center space-x-1">
                    <label htmlFor="city" className="text-gray-600 text-sm">
                        Location:
                    </label>
                    <select
                        id="city"
                        className="border-b border-gray-400 bg-transparent px-2 py-1 text-sm focus:outline-none focus:border-gray-600"
                        value={city}
                        onChange={(e) => {
                            const value = e.target.value;
                            setCity(value === "all" ? value : value.toLowerCase()); // Conditional lowercase
                            setCurrentPage(0);
                        }}
                    >
                        <option value="all">All</option>
                        {cities.map((cityName, index) => (
                            <option key={index} value={cityName}>
                                {cityName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search Bar */}
                <div className="flex-1 min-w-[150px]">
                    <input
                        type="text"
                        placeholder="Search vehicles..."
                        className="border-b border-gray-400 bg-transparent px-2 py-1 text-sm w-full focus:outline-none focus:border-gray-600"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setCurrentPage(0);
                        }}
                    />
                </div>

                {/* Sorting Section */}
                <div className="flex items-center space-x-1">
                    <label htmlFor="sort" className="text-gray-600 text-sm">
                        Sort by:
                    </label>
                    <select
                        id="sort"
                        className="border-b border-gray-400 bg-transparent px-2 py-1 text-sm focus:outline-none focus:border-gray-600"
                        value={sortBy}
                        onChange={handleSortChange}
                    >
                        <option value="default">Default</option>
                        <option value="capacity_asc">Capacity (Lowest First)</option>
                        <option value="capacity_desc">Capacity (Highest First)</option>
                    </select>
                </div>
            </div>

            {/* Show loading state */}
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {/* Vehicle Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.isArray(data?.vehicles) && data.vehicles.length > 0 ? (
                            data.vehicles.map((vehicle) => (
                                <TransporterVehicleCard key={vehicle._id} vehicle={vehicle} />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center w-full">
                                No vehicles available.
                            </p>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center mt-4 mb-1">
                        {totalPages > 1 && (
                            <ReactPaginate
                                pageCount={totalPages}
                                pageRangeDisplayed={5}
                                marginPagesDisplayed={2}
                                onPageChange={handlePageChange}
                                containerClassName="pagination flex list-none space-x-2"
                                pageClassName="page-item flex items-center justify-center w-8 h-8"
                                pageLinkClassName="page-link w-full h-full flex items-center justify-center border rounded-md bg-white hover:bg-gray-200 text-sm font-medium"
                                previousClassName="page-item flex items-center justify-center w-8 h-8"
                                previousLinkClassName="page-link w-full h-full flex items-center justify-center border rounded-md bg-gray-300 hover:bg-gray-400 text-sm font-medium"
                                nextClassName="page-item flex items-center justify-center w-8 h-8"
                                nextLinkClassName="page-link w-full h-full flex items-center justify-center border rounded-md bg-gray-300 hover:bg-gray-400 text-sm font-medium"
                                activeClassName="active"
                                activeLinkClassName="bg-gray-300 border border-gray-300 text-black font-semibold"
                                previousLabel={<span>«</span>}
                                nextLabel={<span>»</span>}
                                forcePage={currentPage}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default VehicleListing;