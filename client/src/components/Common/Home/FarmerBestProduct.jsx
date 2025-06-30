import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ProductCard from '../../Buyer/ProductCard';
import baseURL from '../../../baseurl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FarmerBestProduct = () => {
    const [products, setProducts] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchLatestProducts = async () => {
            try {
                const res = await axios.get(`${baseURL}/api/farmersbestproducts`);
                setProducts(res.data.products);
            } catch (err) {
                console.error('Error fetching latest products:', err);
            }
        };

        fetchLatestProducts();
    }, []);

    const scroll = (offset) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    return (
        <div className="py-4 px-4">
            <h2 className="text-2xl font-semibold mb-6 text-green-800 text-center">Best Products From Farmers</h2>

            <div className="relative">
                {products.length > 3 && (
                    <>
                        <button
                            onClick={() => scroll(-300)}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-green-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scroll(300)}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-green-100"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}

                {/* 📌 ScrollRef moved here */}
                <div ref={scrollRef} className="w-full overflow-x-auto scrollbar-hide">
                    <div className="flex mx-auto space-x-5 w-max px-2">
                        {products.map((product) => (
                            <div key={product._id} className="w-60 shrink-0">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerBestProduct;
