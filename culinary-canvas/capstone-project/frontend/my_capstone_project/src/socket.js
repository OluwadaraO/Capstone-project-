import { io } from "socket.io-client";
const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;
let socket;
export const getSocket = () => {
    if (!socket) {
        socket = io(backendAddress, {
            withCredentials: true,
        });
    }
    return socket;
};
