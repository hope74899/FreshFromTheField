import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../../components/Buyer/ProductCard";
import baseURL from "../../baseurl";
import ReactPaginate from 'react-paginate';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import { useAuth } from "../../auth/AuthToken";
import { pakistaniCities } from "../../assets/data";

// Normalize pakistaniCities to lowercase to match User.city
const normalizedCities = pakistaniCities.map(city => city.toLowerCase());

const ProductListing = () => {
  const { setAllProducts } = useAuth();
  const [category, setCategory] = useState('all');
  const [city, setCity] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 8;
  const [searchTerm] = useDebounce(searchText, 500);
  const cities = normalizedCities;

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['products', currentPage, limit, category, city, sortBy, searchTerm],
    queryFn: async () => {
      const response = await axios.get(
        `${baseURL}/api/farmerproducts?page=${currentPage + 1}&limit=${limit}&category=${category}&city=${city}&sortBy=${sortBy}&searchTerm=${searchTerm}`
      );

      console.log('API Response:', response.data);
      return response.data;
    },
    keepPreviousData: true,
  });

  const handlePageChange = (selectedEvent) => {
    console.log('Selected page:', selectedEvent.selected);
    setCurrentPage(selectedEvent.selected);
  };

  useEffect(() => {
    refetch();
  }, [currentPage, category, city, sortBy, searchTerm, refetch]);

  useEffect(() => {
    if (data?.products && Array.isArray(data.products)) {
      setAllProducts(data.products);
    } else {
      setAllProducts([]);
    }
  }, [data, setAllProducts]);

  const totalPages = data?.totalPages || 0;

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      {/* Section Heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          Fresh Products
        </h2>
      </div>

      {/* Show error message if API fails */}
      {error && <p className="text-red-500 text-center mb-6">{error.message}</p>}

      {/* Filters Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-3 bg-white border-b border-gray-300">
        {/* Category Filter */}
        <div className="flex items-center space-x-1">
          <label htmlFor="category" className="text-gray-600 text-sm">Category:</label>
          <select
            id="category"
            className="border-b border-gray-400 bg-transparent px-2 py-1 text-sm focus:outline-none focus:border-gray-600"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(0);
            }}
          >
            <option value="all">All</option>
            <option value="Fruit">Fruits</option>
            <option value="Vegetable">Vegetables</option>
          </select>
        </div>

        {/* City Filter */}
        <div className="flex items-center space-x-1">
          <label htmlFor="city" className="text-gray-600 text-sm">Location:</label>
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
                {cityName.charAt(0).toUpperCase() + cityName.slice(1)} {/* Display title case */}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="flex-1 min-w-[150px]">
          <input
            type="text"
            placeholder="Search products..."
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
          <label htmlFor="sort" className="text-gray-600 text-sm">Sort by:</label>
          <select
            id="sort"
            className="border-b border-gray-400 bg-transparent px-2 py-1 text-sm focus:outline-none focus:border-gray-600"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="default">Default</option>
            <option value="price_asc">Price (Lowest First)</option>
            <option value="price_desc">Price (Highest First)</option>
          </select>
        </div>
      </div>

      {/* Show loading state */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.isArray(data?.products) && data.products.length > 0 ? (
              data.products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="text-gray-500 text-center w-full">No products available.</p>
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

export default ProductListing;