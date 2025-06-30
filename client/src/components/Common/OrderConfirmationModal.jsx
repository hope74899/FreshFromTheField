/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

const OrderConfirmationModal = ({ isOpen, orderDetails, onClose }) => {
    const navigate = useNavigate();

    // Download order details as PDF
    const downloadOrderDetails = () => {
        if (!orderDetails) return;

        const doc = new jsPDF();
        const margin = 10;
        let y = 10;

        // Helper function to add text and update y position
        const addText = (text, x, fontSize = 12) => {
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(text, 190); // Wrap text within page width
            doc.text(lines, x, y);
            y += lines.length * (fontSize * 0.4); // Adjust line spacing
        };

        // Title
        addText('Order Confirmation', margin, 16);
        y += 5;

        // Order details
        addText(`Order ID: ${orderDetails._id}`, margin);
        addText(`Total Amount: Rs ${orderDetails.totalAmount}`, margin);
        addText('Items:', margin);
        orderDetails.items.forEach((item) => {
            const itemText = `- ${item.productName} ${item.selectedVariety ? `(${item.selectedVariety})` : ''} (x${item.quantity}) - Rs ${item.priceAtOrderTime * item.quantity}`;
            addText(itemText, margin + 5);
        });
        addText(`Delivery Address: ${orderDetails.address.street}, ${orderDetails.address.city}, ${orderDetails.address.province}`, margin);
        addText(`Contact Info: ${orderDetails.contactInfo}`, margin);
        if (orderDetails.deliveryInstructions) {
            addText(`Delivery Instructions: ${orderDetails.deliveryInstructions}`, margin);
        }
        addText(`Status: ${orderDetails.status}`, margin);
        addText(`Placed At: ${new Date(orderDetails.placedAt).toLocaleString()}`, margin);

        // Save PDF
        doc.save(`order_${orderDetails._id}.pdf`);
    };

    if (!isOpen || !orderDetails) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h2 className="text-2xl font-bold text-green-700 mb-4">Order Placed Successfully!</h2>
                <div className="space-y-2 text-sm">
                    <p><strong>Order ID:</strong> {orderDetails._id}</p>
                    <p><strong>Total Amount:</strong> Rs {orderDetails.totalAmount}</p>
                    <p><strong>Items:</strong></p>
                    <ul className="list-disc pl-5">
                        {orderDetails.items.map((item) => (
                            <li key={item.product}>
                                {item.productName} {item.selectedVariety && `(${item.selectedVariety})`} (x{item.quantity}) - Rs {item.priceAtOrderTime * item.quantity}
                            </li>
                        ))}
                    </ul>
                    <p><strong>Delivery Address:</strong> {orderDetails.address.street}, {orderDetails.address.city}, {orderDetails.address.province}</p>
                    <p><strong>Contact Info:</strong> {orderDetails.contactInfo}</p>
                    {orderDetails.deliveryInstructions && (
                        <p><strong>Delivery Instructions:</strong> {orderDetails.deliveryInstructions}</p>
                    )}
                    <p><strong>Status:</strong> {orderDetails.status}</p>
                    <p><strong>Placed At:</strong> {new Date(orderDetails.placedAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-4 mt-4">
                    <button
                        onClick={downloadOrderDetails}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                    >
                        Download as PDF
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            navigate('/order-history');
                        }}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg font-semibold transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationModal;