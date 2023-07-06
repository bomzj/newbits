import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key)
    return storedValue ? JSON.parse(storedValue) : initialValue
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}