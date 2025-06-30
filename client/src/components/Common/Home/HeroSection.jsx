import { Link } from 'react-router-dom';
// import SearchBar from './SearchBar';

function HeroSection() {
  return (
    <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <img
        src="/section page.jpg" // Use your optimized local or CDN image here
        alt="Farmers Market Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
        loading="eager" // or "lazy" depending on preference
        decoding="async"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

      {/* Content */}
      <div className="relative z-20 text-center text-white px-6 sm:px-12 max-w-3xl animate-fadeIn">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Connect Farmers, Buyers & Transporters
        </h1>
        <p className="text-base md:text-lg mb-6">
          Get fresh, local produce delivered directly to you.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Link
            to="/signup"
            aria-label="Sign up for FreshFromTheField"
            className="px-6 py-3 bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 text-white rounded-lg shadow-md transition-all"
          >
            Sign Up
          </Link>
          <Link
            to="/productlisting"
            aria-label="Browse fresh farm products"
            className="px-6 py-3 border border-white text-white hover:bg-yellow-600 hover:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 rounded-lg shadow-md transition-all"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
