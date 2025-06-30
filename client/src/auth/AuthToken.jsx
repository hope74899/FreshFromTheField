import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import baseURL from "../baseurl";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Store user details
    const [allProducts, setAllProducts] = useState(null);
    const [allVehicles, setAllVehicles] = useState(null);
    // console.log('allProducts', allProducts)
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const navigate = useNavigate();

    // ]==]auth role',user?.role)
    // console.log('user',user)
    // console.log('auth role',role)
    // Helper function to store token
    const storeToken = (data) => {
        const serverToken = data.token;
        const tokenExpiry = data.tokenExpiry;
        setToken(serverToken);
        localStorage.setItem("token", serverToken);
        localStorage.setItem("tokenExpiry", tokenExpiry);
        localStorage.setItem("lastActivity", Date.now().toString());
    };

    // Helper function to clear user session
    const clearSession = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        localStorage.removeItem("lastActivity");
        localStorage.removeItem("role");
    };

    // Function to verify and fetch the current user
    const verifyToken = async (serverToken) => {
        try {
            const response = await axios.post(
                `${baseURL}/api/user/current`,
                {}, // Empty body
                {
                    headers: {
                        Authorization: `Bearer ${serverToken}`, // Attach token as Bearer token
                    },
                }
            );

            // Store user data if verification succeeds
            setUser(response.data.user);
            // console.log(response.data.user);

        } catch (err) {
            console.error("Token verification failed:", err.response?.data || err.message);
            clearSession(); // Clear session on error
        }
    };

    // Effect to verify token whenever it changes
    useEffect(() => {
        if (!token) {
            clearSession();
            return; // Avoid running unnecessary code
        }
        verifyToken(token)
    }, [token]);


    // Function to handle logout
    const logout = async () => {
        try {
            if (!user || !user._id) {
                console.error("No user found to log out.");
                clearSession();
                navigate('/'); // Redirect to login page
                return;
            }

            // Call the logout API
            const response = await axios.post(`${baseURL}/api/logout/${user._id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in the headers
                },
                withCredentials: true
            });

            if (response.status === 200) {
                // console.log(response.data.message);
                toast.success(response.data.message)
            } else {
                console.warn("Unexpected logout response:", response);
            }
        } catch (err) {
            console.error("Logout API error:", err.response?.data || err.message);
        } finally {
            document.cookie = "token=; Max-Age=0; path=/";
            clearSession();
            navigate('/');
        }
    };

    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = useCallback(async () => {
        try {
            const response = await axios.get(`${baseURL}/api/cart/count`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCartCount(response.data.count || 0);
        } catch (err) {
            toast.error('Failed to fetch cart count.');
            setCartCount(0);
            console.log(err)
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchCartCount();
    }, [token, fetchCartCount]);
    const [role, setRole] = useState(localStorage.getItem("role") || null);

    useEffect(() => {
        if (user) {
            setRole(user.role || localStorage.getItem("role"));
            localStorage.setItem("role", user.role);
        } else {
            setRole(null);
            localStorage.removeItem("role");
        }
    }, [user]);
    const id = user?._id;
    return (
        <AuthContext.Provider
            value={{
                setUser,
                storeToken,
                logout,
                setAllProducts,
                setAllVehicles,
                fetchCartCount,
                cartCount,
                user,
                role,
                id,
                token,
                allProducts,
                allVehicles,

            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
