import { useState, useEffect } from "react";

export default function useDebounce(query: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedValue(query);
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [delay, query]);

  return debouncedValue;
}
