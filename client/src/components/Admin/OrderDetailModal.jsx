/* eslint-disable react/prop-types */

import { imageurl } from "../../baseurl";

const OrderDetailModal = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Accepted': return 'bg-green-100 text-green-800';
            case 'Delivered': return 'bg-blue-100 text-blue-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center z-10">
                    <h2 className="text-xl font-semibold text-gray-800">Order Details - ID: {order._id}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Summary */}
                    <section className="border-b pb-4">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><strong>Status:</strong> <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></div>
                            <div><strong>Total Amount:</strong> <span className="font-semibold text-green-600">RS {order.totalAmount?.toFixed(2)}</span></div>
                            <div><strong>Placed At:</strong> {new Date(order.placedAt).toLocaleString()}</div>
                            {order.cancelledBy && (
                                <>
                                    <div><strong>Cancelled By:</strong> <span className="capitalize">{order.cancelledBy}</span></div>
                                    <div><strong>Reason:</strong> {order.cancellationReason || 'N/A'}</div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Buyer & Farmer Information */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Buyer Information</h3>
                            {order.buyer ? (
                                <div className="text-sm space-y-1">
                                    <p><strong>Name:</strong> {order.buyer.firstName} {order.buyer.lastName}</p>
                                    <p><strong>Email:</strong> {order.buyer.email}</p>
                                    <p><strong>Role:</strong> <span className="capitalize">{order.buyer.role}</span></p>
                                    {order.contactInfo && <p><strong>Provided Contact:</strong> {order.contactInfo}</p>}
                                </div>
                            ) : <p className="text-sm text-gray-500">Buyer details not available.</p>}
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Farmer Information</h3>
                            {order.farmer ? (
                                <div className="text-sm space-y-1">
                                    <p><strong>Name:</strong> {order.farmer.firstName} {order.farmer.lastName}</p>
                                    <p><strong>Farm:</strong> {order.farmer.farmDetails?.farmName || 'N/A'}</p>
                                    <p><strong>Email:</strong> {order.farmer.email}</p>
                                </div>
                            ) : <p className="text-sm text-gray-500">Farmer details not available.</p>}
                        </div>
                    </section>

                    {/* Delivery Information */}
                    <section className="border-b pb-4">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Delivery Information</h3>
                        <div className="text-sm space-y-1">
                            {order.address ? (
                                <>
                                    <p><strong>Street:</strong> {order.address.street || 'N/A'}</p>
                                    <p><strong>City:</strong> {order.address.city || 'N/A'}</p>
                                    <p><strong>Province:</strong> {order.address.province || 'N/A'}</p>
                                </>
                            ) : <p className="text-sm text-gray-500">Address not provided.</p>}
                            <p><strong>Delivery Instructions:</strong> {order.deliveryInstructions || 'None'}</p>
                        </div>
                    </section>

                    {/* Items Ordered */}
                    <section>
                        <h3 className="text-lg font-medium text-gray-700 mb-3">Items Ordered ({order.items.length})</h3>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={item.product?._id || index} className="flex items-start p-3 bg-gray-50 rounded-md shadow-sm">
                                    {item.product?.images && item.product.images.length > 0 && (
                                        <img
                                            src={`${imageurl}${item.product.images[0]}`}
                                            alt={item.productName}
                                            className="w-16 h-16 object-cover rounded-md mr-4 flex-shrink-0"
                                        />
                                    )}
                                    {!item.product?.images?.length && (
                                        <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                    )}
                                    <div className="flex-grow text-sm">
                                        <p className="font-semibold text-gray-800">{item.productName}</p>
                                        {item.product?.category && <p className="text-xs text-gray-500">Category: {item.product.category}{item.product.subCategory ? ` > ${item.product.subCategory}` : ''}</p>}
                                        <p><strong>Quantity:</strong> {item.quantity} {item.unit || ''}</p>
                                        <p><strong>Price at Order:</strong> RS {item.priceAtOrderTime?.toFixed(2)} / {item.unit || 'unit'}</p>
                                        {item.selectedVariety && <p><strong>Variety:</strong> {item.selectedVariety}</p>}
                                        <p className="font-medium"><strong>Subtotal:</strong> RS {(item.quantity * item.priceAtOrderTime).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="sticky bottom-0 bg-gray-50 px-6 py-3 border-t border-gray-200 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;