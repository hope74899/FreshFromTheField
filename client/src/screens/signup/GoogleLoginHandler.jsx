import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../auth/AuthToken";
import axios from "axios";
import baseURL from "../../baseurl";

const GoogleLoginHandler = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { storeToken } = useAuth();
    const hasExecuted = useRef(false); // Tracks if useEffect logic has executed

    useEffect(() => {
        const handleGoogleLogin = async () => {
            if (hasExecuted.current) {
                // Skip if logic has already executed
                return;
            }
            hasExecuted.current = true; // Mark as executed

            try {
                const { data } = await axios.get(`${baseURL}/api/get-token`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                });

                const { token, expiresIn } = data;

                if (token) {
                    const expiryTime = expiresIn
                        ? Date.now() + expiresIn * 1000
                        : Date.now() + 10 * 24 * 60 * 60 * 1000;

                    storeToken({
                        token,
                        tokenExpiry: expiryTime,
                    });
                    toast.success("Login successful!");
                    navigate("/");
                } else {
                    throw new Error("No token found in the response.");
                }
            } catch (err) {
                console.error("Error during Google login:", err);
                toast.error(err.response?.data?.message || "Failed to authenticate. Please try again.");
                navigate("/login");
            } finally {
                setLoading(false); // Stop loading after processing
            }
        };

        handleGoogleLogin();
    }, [storeToken, navigate]);

    if (loading) {
        return <p>Processing Google Login...</p>; // Replace with spinner if needed
    }

    return null;
};

export default GoogleLoginHandler;
