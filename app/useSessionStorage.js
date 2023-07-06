import { useState, useEffect } from 'react'

export function useSessionStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const storedValue = sessionStorage.getItem(key)
    return storedValue ? JSON.parse(storedValue) : initialValue
  })

  useEffect(() => {
    // undefined can not be stored
    const newValue = value || null
    sessionStorage.setItem(key, JSON.stringify(newValue))
  }, [key, value])

  return [value, setValue]
}