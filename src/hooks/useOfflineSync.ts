"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const LOCAL_STORAGE_KEY_QUEUE = "gymmaster-offline-queue";

export interface OfflineAction {
  id: string;
  type: "ADD_WATER" | "LOG_MEAL";
  payload: Record<string, unknown>;
  timestamp: string;
}

/** Read from localStorage safely — used as lazy initial-state initializer */
function readQueueFromStorage(): OfflineAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_QUEUE);
    return raw ? (JSON.parse(raw) as OfflineAction[]) : [];
  } catch {
    return [];
  }
}

export function useOfflineSync() {
  // Lazy initial state — reads navigator.onLine at first render (client-only)
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  // Lazy initial state — reads persisted queue from localStorage once
  const [queue, setQueue] = useState<OfflineAction[]>(readQueueFromStorage);

  const queueRef = useRef<OfflineAction[]>(queue);

  const syncQueue = async () => {
    const savedQueue = localStorage.getItem(LOCAL_STORAGE_KEY_QUEUE);
    if (!savedQueue) return;

    try {
      const actions: OfflineAction[] = JSON.parse(savedQueue) as OfflineAction[];
      if (actions.length === 0) return;

      // Simulate network round-trip
      await new Promise<void>((resolve) => setTimeout(resolve, 800));

      toast.success(`Đồng bộ thành công ${actions.length} dữ liệu ghi nhận offline!`);

      setQueue([]);
      queueRef.current = [];
      localStorage.removeItem(LOCAL_STORAGE_KEY_QUEUE);
    } catch (e) {
      console.warn("Failed to sync offline queue:", e);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      void syncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Hệ thống đang ngoại tuyến. Dữ liệu mới sẽ được lưu tạm tại thiết bị.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const enqueueAction = (
    type: OfflineAction["type"],
    payload: Record<string, unknown>,
  ) => {
    const newAction: OfflineAction = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    const updatedQueue = [...queueRef.current, newAction];
    queueRef.current = updatedQueue;
    setQueue(updatedQueue);
    localStorage.setItem(LOCAL_STORAGE_KEY_QUEUE, JSON.stringify(updatedQueue));

    if (!isOnline) {
      toast.info("Đã xếp hàng dữ liệu đồng bộ khi kết nối mạng được khôi phục.");
    }
  };

  return {
    isOnline,
    queue,
    enqueueAction,
    syncQueue,
  };
}
