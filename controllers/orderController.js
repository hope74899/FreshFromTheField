const Cart = require('../models/cartModel');
const Order = require('../models/order');
const User = require('../models/users');
const { sendOrderConfirmationToBuyer, sendOrderNotificationToFarmer } = require('../utils/mailer');

const placeOrder = async (req, res) => {
    try {
        const buyerId = req.user._id;
        const { deliveryInstructions, contactInfo, address } = req.body;

        console.log('Placing order for Buyer ID:', buyerId);

        const cart = await Cart.findOne({ buyer: buyerId }).populate('items.product');
        if (!cart) {
            console.error('No cart found for Buyer:', buyerId);
            return res.status(400).json({ message: "Cart not found. Please add products first." });
        }

        if (!cart.items.length) {
            console.error('Cart is empty for Buyer:', buyerId);
            return res.status(400).json({ message: "Cart is empty. Please add items before placing order." });
        }

        // Prepare snapshot of cart items
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            productName: item.product.name,
            unit: item.product.unit,
            priceAtOrderTime: item.product.price,
            quantity: item.quantity,
            selectedVariety: item.selectedVariety || '', // safe fallback
        }));

        // Calculate total amount
        const totalAmount = orderItems.reduce((sum, item) => {
            return sum + (item.priceAtOrderTime * item.quantity);
        }, 0);

        const newOrder = new Order({
            buyer: buyerId,
            farmer: cart.farmer,
            items: orderItems,
            deliveryInstructions,
            contactInfo,
            totalAmount,
            address: {
                street: address?.street || '',
                city: address?.city || '',
                province: address?.province || '', // fixed spelling here
            },
        });

        const response = await newOrder.save();
        console.log('Order placed successfully with ID:', newOrder._id);
        // console.log(response)
        // if (response) {
        //     const famrer = await User.findById(newOrder.farmer)
        //     const buyer = await User.findById(newOrder.buyer)
        //     console.log(famrer, buyer)

        //     const buyerName=
        //     await sendOrderConfirmationToBuyer(buyer.email, newOrder._id);
        //     await sendOrderNotificationToFarmer(famrer.email, buyerName, orderItems, newOrder._id);
        // }

        return res.status(201).json({
            message: "Order placed successfully!",
            order: newOrder,
        });
    } catch (error) {
        console.error('Error in placing order:', error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const buyerId = req.user._id;

        if (!buyerId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        const orders = await Order.find({ buyer: buyerId })
            .populate('items.product', 'name images')
            .populate('farmer', 'firstName lastName')
            .sort({ placedAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user.' });
        }
        console.log('orders', orders)
        res.status(200).json({
            message: 'Orders fetched successfully!',
            orders,
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Get all orders for the authenticated farmer (dashboard)
const getFarmerOrders = async (req, res) => {
    try {
        const farmerId = req.user._id;

        if (!farmerId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        const orders = await Order.find({ farmer: farmerId })
            .populate('items.product', 'name images')
            .populate('buyer', 'firstName lastName')
            .sort({ placedAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this farmer.' });
        }

        res.status(200).json({
            message: 'Farmer orders fetched successfully!',
            orders,
        });
    } catch (error) {
        console.error('Error fetching farmer orders:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, cancelledBy, cancellationReason } = req.body;
        const userId = req.user._id;
        const userRole = req.user.role; // Assuming req.user.role is 'Buyer' or 'Farmer'

        console.log('Order ID:', orderId);
        console.log('User ID:', userId);
        console.log('User Role:', userRole);
        // Validate status
        const validStatuses = ['Pending', 'Accepted', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        // Find order
        const order = await Order.findOne({ _id: orderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        // Log order details for debugging
        console.log('Order Farmer ID:', order.farmer?.toString());
        console.log('Order Buyer ID:', order.buyer?.toString());
        // Check user authorization
        const isBuyer = order.buyer && order.buyer.toString() === userId.toString();
        const isFarmer = order.farmer && order.farmer.toString() === userId.toString();
        if (!isBuyer && !isFarmer) {
            return res.status(403).json({
                message: 'You are not authorized to update this order.',
            });
        }

        // Prevent updates if order is Cancelled or Delivered
        if (order.status === 'Cancelled' || order.status === 'Delivered') {
            return res.status(400).json({
                message: `Cannot update an order with status ${order.status}.`,
            });
        }

        // Status transition rules
        const validTransitions = {
            Pending: ['Accepted', 'Cancelled'],
            Accepted: ['Delivered'],
            Delivered: [],
            Cancelled: [],
        };

        if (!validTransitions[order.status].includes(status)) {
            return res.status(400).json({
                message: `Invalid status transition from ${order.status} to ${status}.`,
            });
        }
        console.log('cancelledBy', cancelledBy)
        // Cancellation logic (only farmers can cancel)
        if (status === 'Cancelled') {
            if (userRole !== 'farmer') {
                return res.status(403).json({ message: 'Only farmers can cancel orders.' });
            }
            if (cancelledBy !== 'farmer') {
                return res.status(400).json({ message: 'cancelledBy must be "farmer" for cancellations.' });
            }
            if (!cancellationReason || cancellationReason.trim() === '') {
                return res.status(400).json({ message: 'Cancellation reason is required.' });
            }
        } else {
            // Non-cancellation updates (only farmers can update to Accepted or Delivered)
            if (['Accepted', 'Delivered'].includes(status) && userRole !== 'farmer') {
                return res.status(403).json({ message: 'Only farmers can update status to Accepted or Delivered.' });
            }
            // Ensure cancelledBy and cancellationReason are null for non-cancelled statuses
            if (cancelledBy || cancellationReason) {
                return res.status(400).json({
                    message: 'cancelledBy and cancellationReason can only be set for Cancelled status.',
                });
            }
        }

        // Update order
        order.status = status;
        order.cancelledBy = status === 'Cancelled' ? cancelledBy : null;
        order.cancellationReason = status === 'Cancelled' ? cancellationReason : null;
        await order.save();

        res.status(200).json({
            message: 'Order status updated successfully!',
            order,
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const getAllOrdersForAdmin = async (req, res, next) => {
    try {
        const orders = await Order.find({}) // Find all orders
            .populate('buyer', 'firstName lastName email role profileImage') // Populate buyer details
            .populate('farmer', 'firstName lastName email role profileImage farmDetails.farmName') // Populate farmer details
            .populate('items.product', 'name images category subCategory') // Populate product details within items
            .sort({ placedAt: -1 }); // Sort by most recent orders first

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                message: 'No orders found.',
                orders: [] // Send empty array if no orders
            });
        }

        res.status(200).json({
            message: 'Orders fetched successfully.',
            count: orders.length,
            orders: orders,
        });

    } catch (err) {
        console.error('Error fetching orders for admin:', err);
        next(err); // Pass to your global error handler
    }
};

const getSingleOrderForAdmin = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID format.' });
        }

        const order = await Order.findById(orderId)
            .populate('buyer', 'firstName lastName email role profileImage')
            .populate('farmer', 'firstName lastName email role profileImage farmDetails.farmName')
            .populate('items.product', 'name images category subCategory');

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        res.status(200).json({
            message: 'Order details fetched successfully.',
            order: order,
        });

    } catch (err) {
        console.error(`Error fetching order ${req.params.orderId} for admin:`, err);
        next(err);
    }
};


module.exports = {
    placeOrder, getOrders, getFarmerOrders, updateOrderStatus, getAllOrdersForAdmin,
    getSingleOrderForAdmin,
};
