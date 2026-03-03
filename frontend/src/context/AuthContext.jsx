import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(localStorage.getItem('username') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
        setIsAuthenticated(false);
        // We will move the redirect logic to a central place or use navigate in components
    }, []);

    // Inactivity Logout (30 Minutes)
    useEffect(() => {
        let timeout;
        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            if (isAuthenticated) {
                timeout = setTimeout(() => {
                    logout();
                    alert('Session expired for security. Please login again.');
                    window.location.href = '/auth';
                }, 1800000); // 30 minutes (30 * 60 * 1000)
            }
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            if (timeout) clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [isAuthenticated, logout]);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', userData.username);
        setUser(userData.username);
        setIsAuthenticated(true);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
