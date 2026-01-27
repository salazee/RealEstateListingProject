import { io } from "socket.io-client";
import { useEffect } from "react";

const socket = io(import.meta.env.VITE_API_URL);

export const useSocket = (userId) => {
  useEffect(() => {
    socket.emit("join", userId);

    socket.on("notification", (data) => {
      console.log("Notification:", data);
    });

    return () => socket.disconnect();
  }, [userId]);
};
