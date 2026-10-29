import { useEffect, useState } from 'react';

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback; // missing, malformed JSON, or storage blocked
  }
}

export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => readStorage(key, initial));
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable: keep working in memory */
    }
  }, [key, value]);
  return [value, setValue];
}
