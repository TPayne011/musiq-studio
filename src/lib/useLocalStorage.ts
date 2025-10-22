"use client";
import { useEffect, useState } from "react";

/**
 * SSR-safe localStorage hook:
 * - Never touches window during server render
 * - No console noise on the server
 * - JSON-serializes values
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const isBrowser = typeof window !== "undefined";

  const [value, setValue] = useState<T>(() => {
    if (!isBrowser) return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // swallow write errors (private mode, quota, etc.)
    }
  }, [key, value, isBrowser]);

  return [value, setValue] as const;
}
