// Orders.jsx (Admin Orders Component)
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Or your preferred HTTP client
import OrderDetailModal from './OrderDetailModal'; // We'll create this modal component
import { useAuth } from '../../auth/AuthToken';
import baseURL from '../../baseurl';
import LoadingSpinner from '../Common/LoadingSpinner';

const Orders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAllOrders = useCallback(async () => {
        if (!token) {
            setError("Authentication token not found.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseURL}/api/admin/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('response', response)
            if (response.data && response.data.orders) {
                setOrders(response.data.orders);
            } else {
                setOrders([]); // Ensure orders is an array even if no orders
            }
        } catch (err) {
            console.log("Error fetching orders:", err.response);
            setError(err.response?.data?.message || err.message || "Failed to fetch orders.");
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAllOrders();
    }, [fetchAllOrders]);

    const handleViewOrderDetails = (order) => {
        setSelectedOrder(order); // We already have full details from the initial fetch
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-600 bg-red-100 rounded-md">
                <p>Error: {error}</p>
                <button
                    onClick={fetchAllOrders}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">All Customer Orders</h1>

            {orders.length === 0 && !isLoading && (
                <p className="text-center text-gray-500">No orders found.</p>
            )}

            {orders.length > 0 && (
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placed At</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-mono" title={order._id}>
                                        {order._id.substring(0, 8)}...
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : 'N/A'}
                                        <br />
                                        <span className="text-xs text-gray-500">{order.buyer?.email}</span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {order.farmer ? `${order.farmer.firstName} ${order.farmer.lastName}` : 'N/A'}
                                        <br />
                                        <span className="text-xs text-gray-500">{order.farmer?.farmDetails?.farmName || order.farmer?.email}</span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        RS {order.totalAmount?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.placedAt).toLocaleDateString()}
                                        <br />
                                        <span className="text-xs">{new Date(order.placedAt).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewOrderDetails(order)}
                                            className="text-indigo-600 hover:text-indigo-900 hover:underline"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default Orders;