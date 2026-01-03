// useConnectionStatus - Uses Socket.IO instead of Supabase Realtime
import { useState, useEffect, useCallback, useRef } from "react";
import socketClient from "@/lib/socketClient";

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

interface UseConnectionStatusReturn {
  status: ConnectionStatus;
  isOnline: boolean;
  reconnect: () => void;
  lastConnectedAt: Date | null;
}

export function useConnectionStatus(): UseConnectionStatusReturn {
  const [status, setStatus] = useState<ConnectionStatus>("connected");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Request Wake Lock to prevent screen from sleeping
  const requestWakeLock = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    if ("wakeLock" in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        console.log("Wake Lock acquired");
        wakeLockRef.current.addEventListener("release", () => {
          console.log("Wake Lock released");
          wakeLockRef.current = null;
        });
      } catch (err) {
        if ((err as Error).name !== "NotAllowedError") {
          console.log("Wake Lock request failed:", err);
        }
      }
    }
  }, []);

  // Release Wake Lock
  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }, []);

  // Exponential backoff reconnection
  const reconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      setStatus("disconnected");
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);

    setStatus("reconnecting");

    setTimeout(() => {
      try {
        socketClient.connect();
        if (socketClient.isConnected()) {
          setStatus("connected");
          setLastConnectedAt(new Date());
          reconnectAttempts.current = 0;
          console.log("Reconnected successfully");
        } else {
          reconnectAttempts.current++;
          reconnect();
        }
      } catch (error) {
        console.error("Reconnection failed:", error);
        reconnectAttempts.current++;
        reconnect();
      }
    }, delay);
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network is back online");
      setIsOnline(true);
      reconnect();
    };

    const handleOffline = () => {
      console.log("Network went offline");
      setIsOnline(false);
      setStatus("disconnected");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [reconnect]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log("Page became visible, checking connection...");
        await requestWakeLock();
        if (!isOnline || status === "disconnected") {
          reconnect();
        }
      } else {
        console.log("Page became hidden");
        releaseWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    requestWakeLock();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isOnline, status, reconnect, requestWakeLock, releaseWakeLock]);

  // Monitor Socket.IO connection status
  useEffect(() => {
    const socket = socketClient.connect();

    const handleConnect = () => {
      console.log("Socket.IO connected");
      setStatus("connected");
      setLastConnectedAt(new Date());
      reconnectAttempts.current = 0;
    };

    const handleDisconnect = () => {
      console.log("Socket.IO disconnected");
      setStatus("disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Check initial state
    if (socket.connected) {
      setStatus("connected");
      setLastConnectedAt(new Date());
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  // Set initial connection time
  useEffect(() => {
    if (status === "connected" && !lastConnectedAt) {
      setLastConnectedAt(new Date());
    }
  }, [status, lastConnectedAt]);

  return {
    status,
    isOnline,
    reconnect,
    lastConnectedAt,
  };
}
