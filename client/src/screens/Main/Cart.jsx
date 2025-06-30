import { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import baseURL, { imageurl } from '../../baseurl';
import { useAuth } from '../../auth/AuthToken';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Calculate total
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handle navigation to ConfirmOrder
  const handleOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Add items before placing an order.');
      return;
    }
    navigate('/confirmOrder', { state: { cartItems, totalAmount } });
  };

  // Fetch cart items
  const fetchCart = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        const formattedItems = response.data.items.map((item) => ({
          id: item.product._id,
          name: item.product.name,
          variety: item.selectedVariety,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0] || { filename: '' },
          maxOrderQty: item.product.maxOrderQty || 10,
        }));
        setCartItems(formattedItems);
        setLoading(false);
      } else {
        toast.error(response.data.message || 'Failed to load cart.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Fetch cart error:', err.response?.data?.message || err.message);
      toast.error('Failed to load cart.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
    }
    return () => clearTimeout(window.debounceTimeout); // Cleanup debounce
  }, [token]);

  // Update quantity
  const updateQuantity = async (id, newQuantity, oldQuantity, maxOrderQty) => {
    if (newQuantity < 1 || newQuantity > maxOrderQty) return;
    try {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
      );
      const response = await axios.patch(
        `${baseURL}/api/cart/${id}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || 'Quantity updated successfully.');
    } catch (err) {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: oldQuantity } : item))
      );
      console.error('Update quantity error:', err.response?.data?.message || err.message);
      toast.error('Failed to update quantity.');
    }
  };

  // Handle input change
  const handleInputChange = (id, value, oldQuantity, maxOrderQty) => {
    const newQuantity = parseInt(value, 10);
    if (isNaN(newQuantity)) return;
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
    clearTimeout(window.debounceTimeout);
    window.debounceTimeout = setTimeout(() => {
      updateQuantity(id, newQuantity, oldQuantity, maxOrderQty);
    }, 500);
  };

  // Handle increment/decrement
  const handleButtonChange = (id, delta, maxOrderQty) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, Math.min(maxOrderQty, item.quantity + delta));
          updateQuantity(id, newQuantity, item.quantity, maxOrderQty);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Remove item
  const removeItem = async (id) => {
    try {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      await axios.delete(`${baseURL}/api/cart/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      toast.error('Failed to remove item.');
      console.error('Remove item error:', err.response?.data?.message || err.message);
      await fetchCart(); // Refetch cart on error
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-8">Your Cart</h1>
        <p className="text-sm text-gray-600 mb-4">
          Note: All items are from a single farmer.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6 max-h-[350px] overflow-y-auto bg-white border border-gray-200 shadow-md p-10 rounded-lg scrollbar">
            {cartItems.length === 0 ? (
              <p className="text-gray-700">Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg shadow p-4 flex items-center"
                >
                  <img
                    src={item.image.filename ? `${imageurl}${item.image.filename}` : 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded mr-4"
                  />
                  <div className="flex-grow">
                    <h2 className="text-lg font-semibold text-gray-700">{item.name}</h2>
                    <p className="text-sm text-gray-500">Variety: {item.variety}</p>
                    <div className="flex items-center mt-2">
                      <label htmlFor={`qty-${item.id}`} className="mr-2 text-sm text-gray-600">
                        Qty:
                      </label>
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => handleButtonChange(item.id, -1, item.maxOrderQty)}
                          className="px-3 py-1 text-gray-700 hover:bg-gray-200"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id={`qty-${item.id}`}
                          value={item.quantity}
                          min={1}
                          max={item.maxOrderQty}
                          onChange={(e) =>
                            handleInputChange(item.id, e.target.value, item.quantity, item.maxOrderQty)
                          }
                          className="w-16 text-center border-none outline-none focus:ring-0 text-sm"
                        />
                        <button
                          onClick={() => handleButtonChange(item.id, 1, item.maxOrderQty)}
                          className="px-3 py-1 text-gray-700 hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-green-700 font-bold">Rs {item.price * item.quantity}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 mt-2"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
            {cartItems.length === 0 ? (
              <p className="text-gray-600">No items in cart.</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm mb-2">
                  <span>
                    {item.name} {item.variety && `(${item.variety})`} (x{item.quantity})
                  </span>
                  <span>Rs {item.price * item.quantity}</span>
                </div>
              ))
            )}
            <div className="flex justify-between text-sm font-semibold mt-4">
              <span>Total:</span>
              <span className="text-green-700">Rs {totalAmount}</span>
            </div>
            <button
              onClick={() => handleOrder()}
              disabled={cartItems.length === 0}
              className={`w-full py-2 mt-4 rounded-lg text-white font-semibold transition ${cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'
                }`}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar::-webkit-scrollbar-track {
          background: #F5F5F5;
          border-radius: 4px;
        }
        .scrollbar::-webkit-scrollbar-thumb {
          background: #15803D;
          border-radius: 4px;
        }
        .scrollbar::-webkit-scrollbar-thumb:hover {
          background: #166534;
        }
      `}</style>
    </div>
  );
};

export default Cart;