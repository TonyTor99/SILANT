import { useRef, useCallback } from "react";

export default function useDebouncedCallback(fn, delay = 300) {
  const t = useRef(null);
  return useCallback((...args) => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}