import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await authApi.getMe();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
        } catch (err) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // Listen for global logout events (e.g., 401 responses)
    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
            setToken(null);
        };
        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const login = async (email, password) => {
        const { data } = await authApi.login({ email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const registerStudent = async (formData) => {
        const { data } = await authApi.registerStudent(formData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const registerClient = async (formData) => {
        const { data } = await authApi.registerClient(formData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                registerStudent,
                registerClient,
                logout,
                loadUser,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}