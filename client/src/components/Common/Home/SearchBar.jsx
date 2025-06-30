import { useState } from "react";
import { CiSearch } from "react-icons/ci";

function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // console.log("Searching for:", query);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative w-full max-w-xl mx-auto" // Centered and responsive
    >
      <div className="relative">
        <input
          type="search" // Use type="search" for better mobile keyboard
          placeholder="Search for fresh produce..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-3 pl-12 pr-4 text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 transition-colors duration-300"
        // Add a transition for smoother visual feedback
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <CiSearch className="text-[20px] text-gray-800" />
        </div>
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center px-4 font-semibold rounded-full bg-green-700 hover:bg-green-800 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchBar;