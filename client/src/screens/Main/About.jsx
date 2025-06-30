import { FaCheckCircle, FaBox, FaTruck } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Hero Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 leading-tight animate-fade-in">
              Join the Fresh Produce Revolution
            </h1>
            <p className="mt-4 text-lg text-gray-700 max-w-md animate-slide-up">
              FreshFromTheField connects farmers, buyers, and transporters to trade fresh produce seamlessly with our innovative order system.
            </p>
            <a
              href="/signup"
              className="mt-6 inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-transform transform hover:scale-105"
            >
              Join the Beta
            </a>
          </div>
          <div className="md:w-1/2">
            <img
              src="/about2.png"
              alt="Fresh Produce"
              className="rounded-lg shadow-md animate-fade-in h-96"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-green-700 text-center mb-12 animate-fade-in">
            How It Works
          </h2>
          <div className="space-y-12">
            {/* Step 1: Farmers List */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pr-6">
                <img
                  src="/about3.png"
                  alt="Farmer Listing"
                  className="rounded-lg shadow-md "
                />
              </div>
              <div className="md:w-1/2">
                <h3 className="text-2xl font-semibold text-gray-700 flex items-center">
                  <FaBox className="text-yellow-600 mr-3" /> List Your Produce
                </h3>
                <p className="mt-3 text-gray-700">
                  Farmers create detailed listings with product name, price, quantity, and availability to reach buyers instantly.
                </p>
              </div>
            </div>
            {/* Step 2: Buyers Order */}
            <div className="flex flex-col md:flex-row-reverse items-center">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pl-6">
                <img
                  src="/about5.png"
                  alt="Buyer Browsing"
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="md:w-1/2">
                <h3 className="text-2xl font-semibold text-gray-700 flex items-center">
                  <FaCheckCircle className="text-yellow-600 mr-3" /> Browse & Order
                </h3>
                <p className="mt-3 text-gray-700">
                  Buyers browse produce by location, add items from one farmer to their cart, and place orders with ease.
                </p>
              </div>
            </div>
            {/* Step 3: Transporters Deliver */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pr-6">
                <img
                  src="/about6.png"
                  alt="Transporter Delivering"
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="md:w-1/2">
                <h3 className="text-2xl font-semibold text-gray-700 flex items-center">
                  <FaTruck className="text-yellow-600 mr-3" /> Coordinate Delivery
                </h3>
                <p className="mt-3 text-gray-700">
                  Transporters connect with farmers and buyers to arrange timely deliveries, ensuring fresh produce reaches its destination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 bg-gray-200 relative">
        <div className="absolute inset-0 bg-[url('/vision.png')] opacity-20 bg-cover bg-center"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-2xl mx-auto bg-white/50 p-8 rounded-lg shadow-md">
            <h2 className="text-3xl md:text-4xl font-bold text-green-700 animate-fade-in">
              Our Vision
            </h2>
            <p className="mt-4 text-lg text-gray-700 animate-slide-up">
              FreshFromTheField is empowering farmers, buyers, and transporters to trade fresh produce efficiently with our cutting-edge order system, built for the future of agriculture.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-200 relative">
        <div className="absolute inset-0 bg-[url('https://via.placeholder.com/1920x400?text=Produce+Handover')] opacity-20 bg-cover bg-center"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-2xl mx-auto bg-white bg-opacity-90 p-8 rounded-lg shadow-md">
            <h2 className="text-3xl md:text-4xl font-bold text-green-700 animate-fade-in">
              Join the Fresh Produce Revolution
            </h2>
            <p className="mt-4 text-lg text-gray-700 animate-slide-up">
              We’re in beta! Be the first to trade fresh produce with FreshFromTheField and help shape the future of agriculture.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <a
                href="/signup"
                className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-transform transform hover:scale-105"
              >
                Join the Beta
              </a>
              <a
                href="/contact"
                className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-transform transform hover:scale-105"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tailwind Animation Styles */}
      <style >{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-in-out;
        }
        .animate-slide-up {
          animation: slideUp 1s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default About;