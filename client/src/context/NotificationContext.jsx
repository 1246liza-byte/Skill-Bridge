import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as notificationApi from '../api/notification';
import { initSocket } from '../utils/socket';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);

    const loadNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await notificationApi.getNotifications();
            setNotifications(data.data || data.notifications || data || []);
        } catch (err) {
            // ignore
        }
    }, [user]);

    const loadUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await notificationApi.getUnreadCount();
            setUnreadCount(data.count || 0);
        } catch (err) {
            // ignore
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadNotifications();
            loadUnreadCount();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, loadNotifications, loadUnreadCount]);

    // Socket connection for real-time notifications
    useEffect(() => {
        if (!user || !token) return;
        let s;
        try {
            s = initSocket(token);
        } catch (err) {
            // Socket is optional; never let it crash the app
            console.error('Socket init failed:', err);
            return;
        }
        if (!s || typeof s.on !== 'function') return;
        setSocket(s);
        s.on('notification:new', (notification) => {
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });
        return () => {
            if (s && typeof s.disconnect === 'function') s.disconnect();
        };
    }, [user, token]);

    const markAsRead = async (id) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            // ignore
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            // ignore
        }
    };

    const deleteNotification = async (id) => {
        try {
            await notificationApi.deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
        } catch (err) {
            // ignore
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                socket,
                loadNotifications,
                loadUnreadCount,
                markAsRead,
                markAllAsRead,
                deleteNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}