import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthToken";
import { useEffect, useRef, useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa6";
import { FaCartArrowDown } from "react-icons/fa6";

const Navbar = () => {
    const { logout, user, role, cartCount } = useAuth();
    // console.log('navbar', role)
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const isLoggedIn = user?.isLoggin || false;

    const navLinkClass = ({ isActive }) =>
        isActive
            ? "text-white font-bold flex flex-col items-center border-b-2 border-yellow-600 w-[80%]"
            : "hover:text-yellow-400 transition duration-300";


    const targetRef = useRef();
    const triggerRef = useRef();
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownVisible && targetRef.current && triggerRef.current && !targetRef.current.contains(event.target) && !triggerRef.current.contains(event.target)) {
                setDropdownVisible(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownVisible])



    return (
        <>
            <nav className="fixed top-0 z-50 h-16 w-full text-white shadow-md bg-green-800">
                <div className="px-4 lg:px-8 lg:py-4 2xl:text-xl md:text-base py-2 md:px-4 md:py-2 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <NavLink to="/" className="flex items-center space-x-2">
                            <span className="md:text-base 2xl:text-2xl font-semibold tracking-wide">FreshFromTheField</span>
                        </NavLink>
                    </div>

                    {/* Navigation Links (Desktop) */}
                    <ul className="hidden md:flex space-x-6 font-medium">
                        <li><NavLink to="/" className={navLinkClass}>Home</NavLink></li>
                        <li><NavLink to="/productlisting" className={navLinkClass}>Farmers</NavLink></li>
                        <li><NavLink to="/vehiclelisting" className={navLinkClass}>Transporter</NavLink></li>
                        <li><NavLink to="/about" className={navLinkClass}>About</NavLink></li>
                        <li><NavLink to="/contact" className={navLinkClass}>Contact</NavLink></li>
                    </ul>

                    {/* Right-side icons and mobile menu button */}
                    <div className="flex items-center gap-6">
                        {isLoggedIn ? (
                            <div className="relative">
                                <button
                                    ref={triggerRef}
                                    className="text-2xl mt-2 text-white hover:text-yellow-400"
                                    onClick={() => setDropdownVisible((prev) => !prev)}
                                >
                                    <FaRegUser />
                                </button>
                                {dropdownVisible && (
                                    <div ref={targetRef} className="absolute right-0 z-10 pt-3 bg-gray-100 text-gray-700 rounded shadow-lg w-36">
                                        <div className="flex flex-col gap-2 px-3 py-5">
                                            <div onClick={() => navigate('/profile')} className="cursor-pointer border-b hover:text-black">Profile</div>
                                            <div className="cursor-pointer hover:text-black">
                                                {role === "farmer" && (
                                                    <button
                                                        onClick={() => navigate('/farmer/dashboard/home')}
                                                    >
                                                        Dashboard
                                                    </button>
                                                )}
                                                {role === "transporter" && (
                                                    <button
                                                        onClick={() => navigate('/transporter/dashboard/home')}
                                                    >
                                                        Dashboard
                                                    </button>
                                                )}
                                                {role === "admin" && (
                                                    <button
                                                        onClick={() => navigate('/admin/dashboard/home')}
                                                    >
                                                        Dashboard
                                                    </button>
                                                )}
                                            </div>
                                            {role === 'buyer' && <div onClick={() => navigate('/order-history')} className="cursor-pointer hover:text-black">
                                                <button >Orders</button>
                                            </div>}

                                            <div className="cursor-pointer hover:text-black">
                                                <button onClick={logout}>Logout</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className="cursor-pointer text-2xl mt-2 text-white hover:text-yellow-400" onClick={() => navigate("/login")}>
                                <FaRegUser />
                            </button>
                        )}
                        {role === 'buyer' && <Link to="/cart" className="relative">
                            <button>
                                <FaCartArrowDown className="cursor-pointer text-2xl mt-2 text-white hover:text-yellow-400" />
                            </button>
                            <p className="absolute right-[-5px] bottom-[-6px] w-5 text-center leading-4 bg-yellow-600 text-white aspect-square rounded-full text-[10px] font-bold pt-[2px]">
                                {cartCount}
                            </p>
                        </Link>}

                        <div className="md:hidden">
                            <button
                                className="text-gray-600 focus:outline-none focus:text-yellow-600 pt-2"
                                onClick={() => setVisible((prev) => !prev)}
                                aria-expanded={visible}
                                aria-label={visible ? "Close Menu" : "Open Menu"}
                            >
                                {visible ? <IoClose className="text-4xl text-orange-600" /> : <IoMenu className="text-4xl text-gray-200" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden ${visible
                        ? "flex flex-col min-h-svh text-md w-full gap-y-6 mt-4 px-6 bg-green-900 text-white shadow-lg py-4"
                        : "hidden"
                        } transition-transform duration-300 ease-in-out transform ${visible ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <Link to="/" className="hover:text-yellow-500 border-b border-gray-700 pb-1">Home</Link>
                    <Link to="/productlisting" className="hover:text-yellow-500 border-b pb-1">Farmers</Link>
                    <Link to="/vehiclelisting" className="hover:text-yellow-500 border-b pb-1">Transporter</Link>
                    <Link to="/about" className="hover:text-yellow-500 border-b pb-1">About</Link>
                    <Link to="/contact" className="hover:text-yellow-500 border-b pb-1">Contact</Link>
                    {/* Conditionally render the signup button based on login status if needed */}
                    {!isLoggedIn && (
                        <div className="flex items-center justify-center mt-4 mb-6">
                            <button onClick={() => navigate("/signup")} className="px-5 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition duration-300">
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
};

export default Navbar;
