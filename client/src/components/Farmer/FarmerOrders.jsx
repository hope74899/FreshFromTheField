import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import baseURL from '../../baseurl';
import { useAuth } from '../../auth/AuthToken';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { FaBoxOpen, FaTimes } from 'react-icons/fa';

const FarmerOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [cancelForm, setCancelForm] = useState({ orderId: null, reason: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch farmer's orders
    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${baseURL}/api/farmer/orders-history`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                setOrders(response.data.orders);
                setLoading(false);
            } else {
                // toast.error(response.data.message || 'Failed to fetch orders.');
                setLoading(false);
            }
        } catch (err) {
            console.error('Fetch orders error:', err.response?.data?.message || err.message);
            // toast.error(err.response?.data?.message || 'Failed to fetch orders.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        } else {
            toast.error('Please log in to view order history.');
            setLoading(false);
        }
    }, [token]);

    // Toggle order details
    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
        setCancelForm({ orderId: null, reason: '' }); // Reset cancel form
    };

    // Update order status
    const updateStatus = async (orderId, newStatus) => {
        setIsSubmitting(true);
        try {
            const response = await axios.patch(
                `${baseURL}/api/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                toast.success('Order status updated successfully!');
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId ? { ...order, status: newStatus } : order
                    )
                );
            } else {
                toast.error(response.data.message || 'Failed to update status.');
            }
        } catch (err) {
            console.error('Update status error:', err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel form submission
    const handleCancelSubmit = async (e) => {
        e.preventDefault();
        if (!cancelForm.reason.trim()) {
            toast.error('Cancellation reason is required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.patch(
                `${baseURL}/api/${cancelForm.orderId}/status`,
                {
                    status: 'Cancelled',
                    cancelledBy: 'farmer',
                    cancellationReason: cancelForm.reason,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                toast.success('Order cancelled successfully!');
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === cancelForm.orderId
                            ? {
                                ...order,
                                status: 'Cancelled',
                                cancelledBy: 'farmer',
                                cancellationReason: cancelForm.reason,
                            }
                            : order
                    )
                );
                setCancelForm({ orderId: null, reason: '' });
            } else {
                toast.error(response.data.message || 'Failed to cancel order.');
            }
        } catch (err) {
            console.error('Cancel order error:', err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || 'Failed to cancel order.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <LoadingSpinner className="text-green-700" />
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className='flex items justify-between mb-8 border-b-2 border-gray-200'>
                    <h1 className="text-3xl font-bold text-green-700  pb-2">
                        Your Order Dashboard
                    </h1>
                    <button>
                        See Nearby Transporters
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
                        <FaBoxOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 text-lg mb-4">No orders found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-transform hover:scale-[1.02]"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-700">
                                        Order #{order._id.slice(-6)}
                                    </h2>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-semibold ${order.status === 'Delivered'
                                            ? 'bg-green-100 text-green-700'
                                            : order.status === 'Cancelled'
                                                ? 'bg-red-100 text-red-700'
                                                : order.status === 'Accepted'
                                                    ? 'bg-yellow-100 text-yellow-600'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            <strong className="font-semibold text-gray-800">Placed At:</strong>{' '}
                                            {new Date(order.placedAt).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong className="font-semibold text-gray-800">Total Amount:</strong> Rs{' '}
                                            {order.totalAmount}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong className="font-semibold text-gray-800">Buyer:</strong>{' '}
                                            {(order.buyer &&
                                                `${order.buyer.firstName ?? ''} ${order.buyer.lastName ?? ''}`.trim()) ||
                                                'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            <strong className="font-semibold text-gray-800">Delivery Address:</strong>{' '}
                                            {order.address.street}, {order.address.city}, {order.address.province}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong className="font-semibold text-gray-800">Contact Info:</strong>{' '}
                                            {order.contactInfo}
                                        </p>
                                        {order.deliveryInstructions && (
                                            <p className="text-sm text-gray-700">
                                                <strong className="font-semibold text-gray-800">
                                                    Delivery Instructions:
                                                </strong>{' '}
                                                {order.deliveryInstructions}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-4 flex space-x-4">
                                    <button
                                        onClick={() => toggleOrderDetails(order._id)}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                                    >
                                        {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                                    </button>
                                    {order.status === 'Pending' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(order._id, 'Accepted')}
                                                disabled={isSubmitting}
                                                className="bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setCancelForm({ orderId: order._id, reason: '' })
                                                }
                                                disabled={isSubmitting}
                                                className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    {order.status === 'Accepted' && (
                                        <button
                                            onClick={() => updateStatus(order._id, 'Delivered')}
                                            disabled={isSubmitting}
                                            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                                        >
                                            Mark as Delivered
                                        </button>
                                    )}
                                </div>
                                {cancelForm.orderId === order._id && (
                                    <div className="mb-4 p-4 bg-gray-50 rounded-md">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            Cancel Order
                                        </h3>
                                        <form onSubmit={handleCancelSubmit}>
                                            <textarea
                                                value={cancelForm.reason}
                                                onChange={(e) =>
                                                    setCancelForm({ ...cancelForm, reason: e.target.value })
                                                }
                                                placeholder="Enter cancellation reason"
                                                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                                                rows="4"
                                                disabled={isSubmitting}
                                            />
                                            <div className="mt-2 flex space-x-2">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                                                >
                                                    Submit Cancellation
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCancelForm({ orderId: null, reason: '' })}
                                                    disabled={isSubmitting}
                                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                                {expandedOrder === order._id && (
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Items</h3>
                                        <div className="divide-y divide-gray-200">
                                            {order.items.map((item) => (
                                                <div
                                                    key={item.product}
                                                    className="py-2 flex justify-between text-sm"
                                                >
                                                    <span className="text-gray-700">
                                                        {item.productName}{' '}
                                                        {item.selectedVariety && `(${item.selectedVariety})`} (x
                                                        {item.quantity})
                                                    </span>
                                                    <span className="text-gray-800 font-medium">
                                                        Rs {item.priceAtOrderTime * item.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        {order.status === 'Cancelled' && (
                                            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-700 rounded-md">
                                                <div className="flex items-center mb-2">
                                                    <FaTimes className="w-5 h-5 text-red-700 mr-2" />
                                                    <h4 className="text-sm font-semibold text-red-700">
                                                        Order Cancelled
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-gray-700">
                                                    <strong className="font-semibold text-gray-800">
                                                        Cancelled By:
                                                    </strong>{' '}
                                                    {order.cancelledBy || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <strong className="font-semibold text-gray-800">
                                                        Cancellation Reason:
                                                    </strong>{' '}
                                                    {order.cancellationReason || 'N/A'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerOrders;