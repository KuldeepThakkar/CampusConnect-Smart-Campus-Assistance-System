import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getAllNotices, markNoticesRead } from "../services/notice";
import { useAuth } from "./AuthContext";

const NoticeContext = createContext(null);

export function NoticeProvider({ children }) {

    const { user } = useAuth();

    const userId = user?.id;

    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load on login / page load, clear on logout. Keyed on the user's id
    // (not the user object) because AuthContext swaps the cached user for a
    // fresh object from getMe() on every page load, which would otherwise
    // trigger a second fetch. The cancelled flag stops a slow response from
    // a previous user landing after logout or an account switch.
    useEffect(() => {

        if (!userId) {
            setNotices([]);
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        const load = async () => {

            setIsLoading(true);

            try {

                const response = await getAllNotices();

                if (!cancelled) {
                    setNotices(response.data.notices);
                }

            } catch (error) {
                console.error(error);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }

        };

        load();

        return () => {
            cancelled = true;
        };

    }, [userId]);

    const refreshNotices = useCallback(async () => {

        try {

            const response = await getAllNotices();
            setNotices(response.data.notices);

        } catch (error) {
            console.error(error);
        }

    }, []);

    // Marks notices read on the server, then refetches so isRead and
    // unreadCount always come from the server rather than being patched
    // locally. Returns true/false so callers can react to failure.
    const markRead = useCallback(async (ids) => {

        if (!ids || ids.length === 0) {
            return true;
        }

        try {

            await markNoticesRead(ids);
            await refreshNotices();

            return true;

        } catch (error) {

            console.error(error);
            return false;

        }

    }, [refreshNotices]);

    // Only students get an isRead flag, so for teachers/admin this is 0.
    const unreadCount = notices.filter((notice) => notice.isRead === false).length; 
    return (
        <NoticeContext.Provider value={{ notices, unreadCount, isLoading, refreshNotices, markRead }}>
            {children}
        </NoticeContext.Provider>
    );

}

export function useNotices() {

    const context = useContext(NoticeContext);

    if (!context) {
        throw new Error("useNotices must be used within a NoticeProvider");
    }

    return context;

}