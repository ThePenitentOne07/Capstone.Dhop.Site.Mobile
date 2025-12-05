import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

interface SocketState {
    socket: Socket | null;
    isConnected: boolean;
    initSocket: (accessToken: string) => void;
    disconnectSocket: () => void;
    reconnectSocket: (accessToken: string) => void;
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
            
            // "io server disconnect" means the server actively disconnected the client
            // This usually happens due to:
            // - Invalid/expired authentication token
            // - Server-side authentication failure
            // - Server policy (rate limiting, session limits, etc.)
            if (reason === "io server disconnect") {
                console.warn("Server disconnected the socket. Possible causes:");
                console.warn("- Token expired or invalid");
                console.warn("- Authentication failure");
                console.warn("- Server policy violation");
                // Disable reconnection for server disconnects to prevent infinite retry loops
                // The app should handle token refresh and reinitialize the socket
                newSocket.io.opts.reconnection = false;
            }
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
            set({ isConnected: false });
            
            // Check if it's an authentication error
            if (err.message?.includes("auth") || err.message?.includes("unauthorized")) {
                console.error("Socket authentication failed. Token may be invalid or expired.");
            }
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

    reconnectSocket: (accessToken: string) => {
        const { socket } = get();
        if (socket) {
            console.log("Reconnecting socket with new token...");
            socket.disconnect();
            set({ socket: null, isConnected: false });
        }
        // Small delay to ensure cleanup before reinitializing
        setTimeout(() => {
            get().initSocket(accessToken);
        }, 100);
    },
}))