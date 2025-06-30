import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useState } from 'react';
import baseURL from '../../baseurl';
import { useAuth } from '../../auth/AuthToken';
import OrderConfirmationModal from '../../components/Common/OrderConfirmationModal'; // Adjust path as needed

const ConfirmOrder = () => {
    const { token, fetchCartCount } = useAuth();
    const { state } = useLocation();
    const { cartItems, totalAmount } = state || { cartItems: [], totalAmount: 0 };
    const [address, setAddress] = useState({ street: '', city: '', province: '' });
    const [deliveryInstructions, setDeliveryInstructions] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const navigate = useNavigate();

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!address.street.trim()) newErrors.street = 'Street is required';
        if (!address.city.trim()) newErrors.city = 'City is required';
        if (!address.province.trim()) newErrors.province = 'Province is required';
        if (!contactInfo.trim()) newErrors.contactInfo = 'Contact info is required';
        return newErrors;
    };

    // Handle order submission
    const handleConfirmOrder = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Please fill all required fields.');
            return;
        }

        if (!token) {
            toast.error('Please log in to place an order.');
            navigate('/login');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `${baseURL}/api/placeOrder`,
                {
                    items: cartItems.map((item) => ({
                        product: item.id,
                        productName: item.name,
                        unit: item.unit || 'unit',
                        priceAtOrderTime: item.price,
                        quantity: item.quantity,
                        selectedVariety: item.variety || '',
                    })),
                    address: {
                        street: address.street,
                        city: address.city,
                        province: address.province,
                    },
                    totalAmount,
                    deliveryInstructions,
                    contactInfo,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                await axios.delete(`${baseURL}/api/cart/clear`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchCartCount();
                setOrderDetails(response.data.order);
                setShowModal(true);
                toast.success(response.data.message || 'Order placed successfully!');
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || 'Failed to place order. Please try again.';
            toast.error(errorMessage);
            console.error('Order placement error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-green-700 mb-8">Confirm Your Order</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Address Form */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Delivery Address</h2>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Street *"
                                    value={address.street}
                                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                    className={`w-full border p-2 rounded-md outline-none text-sm focus:ring-2 focus:ring-green-500 ${errors.street ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="City *"
                                    value={address.city}
                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                    className={`w-full border p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-green-500 ${errors.city ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Province *"
                                    value={address.province}
                                    onChange={(e) => setAddress({ ...address, province: e.target.value })}
                                    className={`w-full border p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-green-500 ${errors.province ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Contact Info (e.g., phone or email) *"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                    className={`w-full border p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-green-500 ${errors.contactInfo ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.contactInfo && (
                                    <p className="text-red-500 text-xs mt-1">{errors.contactInfo}</p>
                                )}
                            </div>
                            <textarea
                                placeholder="Delivery Instructions"
                                value={deliveryInstructions}
                                onChange={(e) => setDeliveryInstructions(e.target.value)}
                                className="w-full border border-gray-300 p-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-green-500"
                                rows={3}
                            />
                        </div>
                    </div>
                    {/* Order Summary */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
                        {cartItems.length === 0 ? (
                            <p className="text-gray-600">No items in cart.</p>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between mb-2 text-sm">
                                    <span>
                                        {item.name} {item.variety && `(${item.variety})`} (x{item.quantity})
                                    </span>
                                    <span>Rs {item.price * item.quantity}</span>
                                </div>
                            ))
                        )}
                        <div className="flex justify-between font-semibold text-sm mt-4">
                            <span>Total:</span>
                            <span>Rs {totalAmount}</span>
                        </div>
                        <button
                            onClick={handleConfirmOrder}
                            disabled={isSubmitting || cartItems.length === 0}
                            className={`w-full mt-4 py-2 rounded-lg text-white font-semibold transition ${isSubmitting || cartItems.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-700 hover:bg-green-800'
                                }`}
                        >
                            {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Confirmation Modal */}
            <OrderConfirmationModal
                isOpen={showModal}
                orderDetails={orderDetails}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
};

export default ConfirmOrder;