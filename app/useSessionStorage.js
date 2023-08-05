import { useState, useEffect } from 'react'

export function useSessionStorage(key, initialValue) {
  const [value, setValue] = useState()

  // init
  useEffect(() => {
    const storedValue = sessionStorage.getItem(key)
    const value = storedValue ? JSON.parse(storedValue) : initialValue
    setValue(value)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // undefined can not be stored
    if (value === undefined) return
    sessionStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}