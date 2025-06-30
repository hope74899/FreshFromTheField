import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import useTokenExpiration from "./auth/useTokenExpiration ";
import ScrollToTop from "./components/Common/ScrollToTop";
import Navbar from "./components/Common/Navbar";
import Footer from "./components/Common/Footer";
import Profile from "./screens/Main/Profile";
import ProductDetail from "./screens/Main/ProductDetail";
import FarmerProfilePage from "./screens/Main/FarmerProfilePage ";
import Sidebar from "./components/Common/Sidebar";
import LoadingSpinner from "./components/Common/LoadingSpinner";
import TransporterHome from "./components/Transporter/TransporterHome";
import FarmerHome from "./components/Farmer/FarmerHome";
import ViewProduct from "./components/Farmer/ViewProduct";
import CreateProductForm from "./components/Farmer/CreateProductForm";
import AdminHome from "./components/Admin/AdminHome";
import AdminPendingProducts from "./components/Admin/AdminPendingProducts";
import ViewUsers from "./components/Admin/ViewUsers";
import FarmerProducts from "./components/Admin/FarmerProducts";
import { useAuth } from "./auth/AuthToken";
import FarmerPendingProducts from "./components/Farmer/FarmerPendingProducts";
import ApprovedProducts from "./components/Farmer/ApprovedProducts";
import BestProducts from "./components/Farmer/BestProducts";
import AdminFarmers from "./components/Admin/AdminFarmers";
import AdminTransporter from "./components/Admin/AdminTransporter";
import FarmToBuyer from "./components/Common/Home/Blogs/FarmToBuyer";
import FreshProduce from "./components/Common/Home/Blogs/FreshProduce";
import Transporter from "./components/Common/Home/Blogs/Transporter";
import VehicleListing from "./screens/Main/VehicleListing";
import VehicleDetail from "./screens/Main/VehicleDetail";
import TransporterProfilePage from "./screens/Main/TransporterProfilePage";
import ViewVehicles from "./components/Transporter/ViewVehicles";
import CreateVehicleForm from "./components/Transporter/CreateVehicleForm";
import TransporterPendingVehicles from "./components/Transporter/TransporterPendingVehicles";
import ApprovedVehicles from "./components/Transporter/ApprovedVehicles";
import BestVehicles from "./components/Transporter/BestVehicles";
import Contact from "./screens/Main/Contact";
import About from "./screens/Main/About";
import ConfirmOrder from "./screens/Main/ConfirmOrder";
import Cart from "./screens/Main/Cart";
import OrderHistory from "./screens/Main/OrderHistory";
import FarmerOrders from "./components/Farmer/FarmerOrders";
import PrivacyPolicy from "./screens/Main/PrivacyPolicy";
import TermsOfService from "./screens/Main/TermsOfService";
import TransporterVehicles from "./components/Admin/TransporterVehicles";
import Orders from "./components/Admin/Orders";


// Lazy-loaded components for performance optimization
const Home = lazy(() => import("./screens/Main/Home"));
const ProductListing = lazy(() => import("./screens/Main/ProductListing"));
const Login = lazy(() => import("./screens/signup/Login"));
const Signup = lazy(() => import("./screens/signup/Signup"));
const OTP = lazy(() => import("./screens/signup/OTP"));
const ForgotPassword = lazy(() => import("./screens/signup/ForgetPassword"));
const UpdatePassword = lazy(() => import("./screens/signup/UpdatePassword"));
const GoogleLoginHandler = lazy(() => import("./screens/signup/GoogleLoginHandler"));

const Loading = () => <div><LoadingSpinner /></div>;
const LayoutWithNavbarAndFooter = () => {
    return (
        <div className="flex flex-col h-screen">
            {/* Fixed Navbar */}
            <Navbar className='flex-shrink-0' />

            <div className="mt-16 flex flex-col flex-1 overflow-auto scrollbar-custom">
                <main className="flex-1">
                    <Outlet />
                </main>
                <Footer className=" w-full bg-gray-700 text-white" />
            </div>
        </div>
    );
};

const MainLayout = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Navbar */}
            <Navbar className="flex-shrink-0" />
            <div className="mt-16 flex flex-grow overflow-hidden">
                <Sidebar className='top-20 flex-shrink-0' />
                <main className="p-4 flex-grow overflow-y-auto bg-gray-100">
                    <Outlet />
                </main>
            </div>

        </div>
    );
};



const routes = [
    // Farmer routes prefixed (example)
    { path: '/farmer/dashboard/home', component: FarmerHome, roles: ['farmer'] },
    { path: '/farmer/dashboard/orderHistory', component: FarmerOrders, roles: ['farmer'] },
    { path: '/farmer/dashboard/products', component: ViewProduct, roles: ['farmer'] },
    { path: '/farmer/dashboard/add', component: CreateProductForm, roles: ['farmer'] },
    { path: '/farmer/dashboard/pending', component: FarmerPendingProducts, roles: ['farmer'] },
    { path: '/farmer/dashboard/approved', component: ApprovedProducts, roles: ['farmer'] },
    { path: '/farmer/dashboard/best', component: BestProducts, roles: ['farmer'] },


    // Transporter routes prefixed
    { path: '/transporter/dashboard/home', component: TransporterHome, roles: ['transporter'] },
    { path: '/transporter/dashboard/Vehicles', component: ViewVehicles, roles: ['transporter'] },
    { path: '/transporter/dashboard/add', component: CreateVehicleForm, roles: ['transporter'] },
    { path: '/transporter/dashboard/pending', component: TransporterPendingVehicles, roles: ['transporter'] },
    { path: '/transporter/dashboard/approved', component: ApprovedVehicles, roles: ['transporter'] },
    { path: '/transporter/dashboard/best', component: BestVehicles, roles: ['transporter'] },

    // Admin routes prefixed
    { path: '/admin/dashboard/home', component: AdminHome, roles: ['admin'] },
    { path: '/admin/dashboard/products', component: AdminPendingProducts, roles: ['admin'] }, // Changed path
    { path: '/admin/dashboard/users', component: ViewUsers, roles: ['admin'] },
    { path: '/admin/dashboard/farmers', component: AdminFarmers, roles: ['admin'] },
    { path: '/admin/dashboard/transporter', component: AdminTransporter, roles: ['admin'] },
    { path: '/farmer/dashboard/farmerproducts/:id', component: FarmerProducts, roles: ['admin'] },
    { path: '/transporter/dashboard/transportervehicles/:id', component: TransporterVehicles, roles: ['admin'] },
    { path: '/admin/dashboard/orders', component: Orders, roles: ['admin'] },

];

function App() {
    const navigate = useNavigate();
    const { role, user } = useAuth();
    const [isLoading, setIsLoading] = useState(true)
    console.log({ role, user })
    useEffect(() => {
        if (user?.profileComplete === false) {
            navigate("/profile")
        }
    }, [user, role])
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 2000)
    }, []);

    useTokenExpiration();

    if (isLoading) {
        return <Loading />;
    }
    return (
        <>
            <ScrollToTop />
            <Suspense fallback={<Loading />}>
                <Routes>
                    {/* Routes with Navbar and Footer */}
                    <Route element={<LayoutWithNavbarAndFooter />}>
                        <Route path="/" index element={<Home />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/confirmOrder" element={<ConfirmOrder />} />
                        <Route path="/order-history" element={<OrderHistory />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />

                        {/* farmer routes */}
                        <Route path="/productlisting" element={<ProductListing />} />
                        <Route path="/productdetail/:id" element={<ProductDetail />} />
                        <Route path="/farmerprofile/:id" element={<FarmerProfilePage />} />
                        {/* Transporter routes */}
                        <Route path="/vehiclelisting" element={<VehicleListing />} />
                        <Route path="/vehicledetail/:id" element={<VehicleDetail />} />
                        <Route path="/transporterprofile/:id" element={<TransporterProfilePage />} />



                        {/* blogs routes */}
                        <Route path="/farm-to-buyer" element={<FarmToBuyer />} />
                        <Route path="/transporter" element={<Transporter />} />
                        <Route path="/freshProduce" element={<FreshProduce />} />
                    </Route>
                    <Route path="/profile" element={<Profile />} />
                    {/* Routes without Navbar and Footer */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/otp" element={<OTP />} />
                    <Route path="/forget-password" element={<ForgotPassword />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route path="/google-login" element={<GoogleLoginHandler />} />
                    {/* Main Layout with Navbar and Sidebar */}
                    <Route element={<MainLayout />}>
                        {routes.map((route) => (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={<route.component />}
                            />
                        ))}
                    </Route>
                </Routes>
            </Suspense>
        </>
    );
}

export default App;
