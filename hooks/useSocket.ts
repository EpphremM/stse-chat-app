"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export type SocketMessage = Record<string, unknown>;

export const useSocket = (roomId: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      if (roomId) {
        socket.emit("join-room", roomId);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- socket is singleton; room join handled below
  }, []);

  useEffect(() => {
    if (socketRef.current && isConnected && roomId) {
      socketRef.current.emit("join-room", roomId);
    }
  }, [roomId, isConnected]);

  const sendMessage = (data: SocketMessage) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("send-message", { ...data, roomId });
    }
  };

  const sendTyping = (userId: string, isTyping: boolean) => {
    if (socketRef.current && isConnected && roomId) {
      socketRef.current.emit("typing", { roomId, userId, isTyping });
    }
  };

  const onMessage = (callback: (data: SocketMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.on("receive-message", callback);
    }
    return () => {
      socketRef.current?.off("receive-message", callback);
    };
  };

  const onTyping = (callback: (data: SocketMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.on("user-typing", callback);
    }
    return () => {
      socketRef.current?.off("user-typing", callback);
    };
  };

  return {
    isConnected,
    sendMessage,
    sendTyping,
    onMessage,
    onTyping,
  };
};
