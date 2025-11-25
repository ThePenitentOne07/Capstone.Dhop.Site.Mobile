import {create} from 'zustand'

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
    data?: any;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isModalOpen: boolean;

    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    setNotifications: (notifications: Notification[]) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    openModal: () => void;
    closeModal: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    isModalOpen: false,

    addNotification: (notification) => {
        const newNotif: Notification = {
            ...notification,
            id: `notif_${Date.now()}_${Math.random()}`,
            timestamp: new Date(),
            read: false,
        };

        set((state) => ({
            notifications: [newNotif, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }));
    },

    setNotifications: (notifications) => {
        set({
            notifications,
            unreadCount: notifications.filter((n) => !n.read).length,
        });
    },

    markAsRead: (id) => {
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
        }));
    },

    markAllAsRead: () => {
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
        }));
    },

    removeNotification: (id) => {
        set((state) => {
            const notif = state.notifications.find((n) => n.id === id);
            return {
                notifications: state.notifications.filter((n) => n.id !== id),
                unreadCount: notif && !notif.read ? state.unreadCount - 1 : state.unreadCount,
            };
        });
    },

    clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
    },

    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),
}));