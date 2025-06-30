const express = require('express')
const router = express.Router();
const googlerouter = express.Router();
const authMiddleware = require('../middleware/tokenAuth')
const uploadFiles = require('../middleware/multerMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const errorMiddleware = require('../middleware/errorHandlerMiddleware');
const passport = require('passport');

const { createUser, getUser, getUserById, updateUser, updateUserByAdmin, deleteUser, login, currentUser, verifyOTP, logout, searchEmail, updatePassword, googleCallback, getToken } = require('../controllers/user')
const { sendOTP } = require('../controllers/sendOTP');


router.post('/api/user/create', createUser)
router.get('/api/user/get', authMiddleware, adminMiddleware, getUser)
router.get('/api/user/getbyid/:userId', authMiddleware, adminMiddleware, getUserById)
router.put('/api/user/update/:id', uploadFiles, authMiddleware, updateUser)
router.put('/api/user/updatebyadmin/:userId', authMiddleware, adminMiddleware, updateUserByAdmin)
router.delete('/api/user/delete/:id', deleteUser)
router.post('/api/user/login', login)
router.post('/api/user/current', authMiddleware, currentUser)
router.post('/api/otp-verify', verifyOTP)
router.post('/api/resendotp', sendOTP)
router.post('/api/logout/:userId', authMiddleware, logout)
router.post('/api/forgot-password', searchEmail)
router.put('/api/update-password', updatePassword)

router.get('/api/get-token', getToken);
router.get('/api/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleCallback);

const { getDashboardStats, getRecentProducts } = require('../controllers/admin'); // Adjust path

router.get('/api/admin/dashboard/stats', errorMiddleware, getDashboardStats);
router.get('/api/admin/products/recent', errorMiddleware, getRecentProducts);


const { createFarmerProduct, getAllFarmerProducts, getPendingProducts, getFarmerProductById, updateFarmerProduct, deleteFarmerProduct, getFarmerProductsByUserId, getFarmerProductsDetails, deleteProductImage, getLatestFarmerProducts, getFarmersBestProducts } = require("../controllers/farmerProducts");

router.post("/api/farmerproduct/create/:id", uploadFiles, createFarmerProduct);
router.get("/api/farmerproducts", getAllFarmerProducts);
router.get("/api/pendingproducts", getPendingProducts);
router.get("/api/farmerproduct/:id", getFarmerProductById);
router.patch("/api/farmerproduct/update/:id", authMiddleware, uploadFiles, updateFarmerProduct);
router.delete("/api/farmerproduct/delete/:id", authMiddleware, deleteFarmerProduct);
router.get("/api/farmerproducts/:farmerId", getFarmerProductsByUserId);
router.get("/api/farmerproducts/:farmerId/details", getFarmerProductsDetails);
router.patch("/api/farmerproduct/delete-image/:productId", authMiddleware, deleteProductImage);

router.get("/api/latestfamrerproducts", getLatestFarmerProducts);
router.get("/api/farmersbestproducts", getFarmersBestProducts);


const { createVehicle, getAllVehicles, getPendingVehicles, getVehicleById, updateVehicle, deleteVehicle, getVehiclesByUserId, getVehiclesDetails, deleteVehicleImage, getLatestVehicles, getTransportersBestVehicles } = require("../controllers/transporterVehicles");


router.post("/api/vehicle/create/:id", uploadFiles, createVehicle);
router.get("/api/vehicles", getAllVehicles);
router.get("/api/pendingvehicles", getPendingVehicles);
router.get("/api/vehicle/:id", getVehicleById);
router.patch("/api/vehicle/update/:id", authMiddleware, uploadFiles, updateVehicle);
router.delete("/api/vehicle/delete/:id", deleteVehicle);
router.get("/api/vehicles/:transporterId", getVehiclesByUserId);
router.get("/api/vehicles/:transporterId/details", getVehiclesDetails);
router.patch("/api/vehicle/delete-image/:vehicleId", authMiddleware, deleteVehicleImage);
router.get("/api/latestvehicles", getLatestVehicles);
router.get("/api/transportersbestvehicles", getTransportersBestVehicles);

const { addToCart, getCart, removeItem, clearCart, updateCartItemQuantity, getCartCount } = require("../controllers/cartController");

router.post("/api/cart/add", authMiddleware, addToCart);
router.get("/api/cart", authMiddleware, getCart);
router.delete("/api/cart/remove/:productId", authMiddleware, removeItem);
router.delete("/api/cart/clear", authMiddleware, clearCart);
router.patch("/api/cart/:productId", authMiddleware, updateCartItemQuantity);
router.get("/api/cart/count", authMiddleware, getCartCount);

const { placeOrder, getOrders, getFarmerOrders, updateOrderStatus, getAllOrdersForAdmin, getSingleOrderForAdmin, } = require('../controllers/orderController');
router.post("/api/placeOrder", authMiddleware, placeOrder);
router.get('/api/buyer/orders-history', authMiddleware, getOrders);
router.get('/api/farmer/orders-history', authMiddleware, getFarmerOrders);
router.get('/api/admin/orders', authMiddleware, adminMiddleware, getAllOrdersForAdmin);
router.get('/api/admin/orders/:orderId', authMiddleware, adminMiddleware, getSingleOrderForAdmin);
router.patch('/api/:orderId/status', authMiddleware, updateOrderStatus);


const { sendMessage } = require('../controllers/contact');
router.post("/api/contact", authMiddleware, sendMessage);

module.exports = router;