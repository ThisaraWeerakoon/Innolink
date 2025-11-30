import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Create axios instance
    const api = axios.create({
        baseURL: 'https://innolink-backend-atbnh9h5h4h7fyhc.eastus-01.azurewebsites.net/api',
    });

    // Attach token to requests
    api.interceptors.request.use(
        (config) => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                config.headers.Authorization = `Bearer ${storedToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    // Verify token with backend
                    const response = await api.get('/auth/verify');
                    setUser(response.data);
                    setToken(storedToken);
                } catch (error) {
                    console.error("Token verification failed", error);
                    // If verification fails, clear everything
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            // Response now contains { accessToken, userId, email, role, tokenType }
            const { accessToken, userId, email: userEmail, role } = response.data;

            const userData = {
                id: userId,
                email: userEmail,
                role: role
            };

            setToken(accessToken);
            setUser(userData);

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));

            return userData;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (userData) => {
        return api.post('/auth/register', userData);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        api, // ProtectedRequest helper
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
