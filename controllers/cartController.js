const Cart = require("../models/cartModel");
const FarmerProduct = require("../models/farmerProducts");

const addToCart = async (req, res) => {
    try {
        const { productId, quantity, selectedVariety } = req.body;
        const buyerId = req.user._id;

        console.log('Incoming Request:', { buyerId, productId, quantity, selectedVariety });

        // Basic input validation
        if (!productId || !quantity) {
            console.error('Missing productId or quantity');
            return res.status(400).json({ message: "Product ID and quantity are required." });
        }

        const product = await FarmerProduct.findById(productId);
        if (!product) {
            console.error('Product not found:', productId);
            return res.status(404).json({ message: "Product not found." });
        }
        if (!product.availability) {
            console.error('Product unavailable:', productId);
            return res.status(400).json({ message: "Product is currently unavailable." });
        }

        const farmerId = product.farmer._id;

        let cart = await Cart.findOne({ buyer: buyerId });

        if (!cart) {
            // console.log('No existing cart found. Creating new cart...');
            cart = new Cart({
                buyer: buyerId,
                farmer: farmerId,
                items: [{ product: productId, quantity, selectedVariety }],
            });
            // console.log('New cart created:', cart);
        } else {
            // console.log('Existing cart found:', cart);

            if (!cart.farmer.equals(farmerId)) {
                console.error('Cart farmer mismatch');
                return res.status(400).json({
                    message: "You can only add products from one farmer at a time.",
                });
            }

            // console.log('Cart Items before update:', cart.items.map(item => ({
            //     product: item.product.toString(),
            //     quantity: item.quantity,
            //     selectedVariety: item.selectedVariety
            // })));

            const existingItemIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId
            );
            // console.log('existingItemIndex:', existingItemIndex);

            if (existingItemIndex !== -1) {
                cart.items[existingItemIndex].quantity += quantity;
                // console.log('Updated quantity for existing item.');
            } else {
                cart.items.push({ product: productId, quantity, selectedVariety });
                // console.log('Added new item to cart.');
            }
        }

        const savedCart = await cart.save();
        console.log('Cart saved successfully:', savedCart);

        return res.status(200).json({ message: 'Cart updated successfully', cart: savedCart });

    } catch (error) {
        console.error('Error in addToCart:', error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const getCart = async (req, res) => {
    try {
        const buyerId = req.user._id; // Use auth middleware
        console.log('buyerId', buyerId)
        const cart = await Cart.findOne({ buyer: buyerId }).populate({
            path: "items.product",
            select: "name price images maxOrderQty varieties" // Optimize fields
        });

        if (!cart) {
            return res.status(404).json({ message: "Cart is empty." });
        }
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const removeItem = async (req, res) => {
    try {
        const buyerId = req.user._id;
        const { productId } = req.params;

        const cart = await Cart.findOne({ buyer: buyerId });
        if (!cart) return res.status(404).json({ message: "Cart not found." });

        cart.items = cart.items.filter(item => !item.product.equals(productId));
        await cart.save();

        res.status(200).json({ message: "Item removed.", cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const clearCart = async (req, res) => {
    try {
        const buyerId = req.user._id;
        console.log(buyerId)
        const cart = await Cart.findOneAndDelete({ buyer: buyerId });
        if (!cart) return res.status(404).json({ message: "Cart already empty." });

        res.status(200).json({ message: "Cart cleared." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateCartItemQuantity = async (req, res) => {
    try {
        const buyerId = req.user._id;
        const { productId } = req.params;
        const { quantity } = req.body;

        console.log(buyerId, productId)
        console.log(quantity)

        if (quantity < 1 || quantity > 10) {
            return res.status(400).json({ message: "Quantity must be between 1 and 10." });
        }

        const cart = await Cart.findOne({ buyer: buyerId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        const itemIndex = cart.items.findIndex((item) => item.product.equals(productId));
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart." });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        const updatedCart = await Cart.findOne({ buyer: buyerId }).populate("items.product");
        res.status(200).json({ updatedCart, message: 'Quantity updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const getCartCount = async (req, res) => {
    try {
        const cart = await Cart.findOne({ buyer: req.user._id });
        res.status(200).json({ count: cart ? cart.items.length : 0 });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch cart count.' });
    }
};
module.exports = {
    addToCart,
    getCart,
    removeItem,
    clearCart,
    updateCartItemQuantity,
    getCartCount
};
