// src/context/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(new Set());

    // Load from localStorage on first render
    useEffect(() => {
        const storedNotifs = JSON.parse(localStorage.getItem("notifications")) || [];
        const storedUnread = JSON.parse(localStorage.getItem("unreadNotifications")) || [];
        if (storedNotifs.length > 0) {
            setNotifications(storedNotifs);
            setUnread(new Set(storedUnread));
        } else {
            fetchNotifications();
        }
    }, []);

    const fetchNotifications = async (userId = null) => {
        try {
            let url = "https://ecommerce-8342.onrender.com/api/notifications/collect";
            if (userId) {
                url = `https://ecommerce-8342.onrender.com/api/notifications/user/${userId}`;
            }
            
            const res = await axios.get(url);
            const fetched = res.data.notifications || [];

            // Load old localStorage BEFORE overwriting
            const oldStoredNotifs = JSON.parse(localStorage.getItem("notifications")) || [];
            const storedUnread = JSON.parse(localStorage.getItem("unreadNotifications")) || [];

            const storedUnreadSet = new Set(storedUnread);
            const oldIds = oldStoredNotifs.map((n) => n.id);
            const fetchedIds = fetched.map((n) => n.id);

            // Mark as unread only if it's not in old notifications at all
            fetchedIds.forEach((id) => {
                if (!oldIds.includes(id) && !storedUnreadSet.has(id)) {
                    storedUnreadSet.add(id); // new notification → unread
                }
            });

            // Save updated state
            setNotifications(fetched);
            localStorage.setItem("notifications", JSON.stringify(fetched));

            setUnread(storedUnreadSet);
            localStorage.setItem("unreadNotifications", JSON.stringify([...storedUnreadSet]));
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };


    // Mark a single notification as read
    const markAsRead = (id) => {
        setUnread((prev) => {
            const updated = new Set(prev);
            updated.delete(id);
            localStorage.setItem("unreadNotifications", JSON.stringify([...updated]));
            return updated;
        });
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        setUnread(new Set());
        localStorage.setItem("unreadNotifications", JSON.stringify([]));
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unread,
                markAsRead,
                markAllAsRead,
                fetchNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);
