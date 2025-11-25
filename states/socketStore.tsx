import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

interface SocketState {
    socket: Socket | null;
    isConnected: boolean;
    initSocket: (accessToken: string) => void;
    disconnectSocket: () => void;
}


export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    isConnected: false,

    initSocket: (accessToken: string) => {
        const { socket } = get();

        //if socket already exist return
        if (socket) return;

        const socketUrl = process.env.EXPO_PUBLIC_WS_URL;

        const newSocket = io(socketUrl, {
            path: "/socket.io/",
            transports: ["websocket", "polling"],
            query: { token: accessToken },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on("connect", () => {
            console.log("Socket Connected", newSocket.io)
            set({ isConnected: true })
        })


        newSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            set({ isConnected: false });
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
            set({ isConnected: false });
        });

        set({ socket: newSocket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            console.log("Disconnecting socket...");
            socket.disconnect();
            set({ socket: null, isConnected: false });
        }
    },
}))