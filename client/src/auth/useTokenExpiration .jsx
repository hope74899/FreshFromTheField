import { useEffect, useRef } from "react";
import { useAuth } from "./AuthToken";

const useTokenExpiration = () => {
    const { logout } = useAuth();
    const hasLoggedOut = useRef(false);

    const safeGetItem = (key, defaultValue = null) => {
        try {
            return localStorage.getItem(key) || defaultValue;
        } catch (error) {
            console.error(`Error accessing localStorage key "${key}":`, error);
            return defaultValue;
        }
    };

    const safeSetItem = (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    useEffect(() => {
        // Prevent further execution if already logged out
        if (hasLoggedOut.current) return;

        // Retrieve and validate token expiry
        const tokenExpiry = parseInt(safeGetItem("tokenExpiry"), 10);
        if (!tokenExpiry || isNaN(tokenExpiry)) {
            // console.warn("Invalid or missing tokenExpiry value.");
            return; // Stop execution if no valid tokenExpiry
        }

        const handleUserActivity = () => {
            safeSetItem("lastActivity", Date.now().toString());
        };

        const checkLogout = () => {
            const lastActivity = parseInt(safeGetItem("lastActivity", "0"), 10);
            const currentTime = Date.now();

            if (currentTime - lastActivity >= 24 * 60 * 60 * 1000 || currentTime >= tokenExpiry) {
                hasLoggedOut.current = true;
                logout();
            }
        };

        window.addEventListener("mousemove", handleUserActivity);
        window.addEventListener("keydown", handleUserActivity);

        const logoutInterval = setInterval(checkLogout, 60000);

        return () => {
            clearInterval(logoutInterval);
            window.removeEventListener("mousemove", handleUserActivity);
            window.removeEventListener("keydown", handleUserActivity);
        };
    }, [logout]);
};

export default useTokenExpiration;
