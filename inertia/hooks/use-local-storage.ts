import { useCallback, useEffect, useState } from 'react'

/** Prefix for string values so we don't store them as JSON (which adds quotes in localStorage). */
const STRING_PREFIX = '\u200B' // zero-width space: invisible, preserves "no quotes" display

function serialize<T>(value: T): string {
  if (typeof value === 'string') {
    return STRING_PREFIX + value
  }
  return JSON.stringify(value)
}

function deserialize<T>(raw: string): T {
  if (raw.startsWith(STRING_PREFIX)) {
    return raw.slice(STRING_PREFIX.length) as T
  }
  return JSON.parse(raw) as T
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Always start with initialValue to match SSR
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isMounted, setIsMounted] = useState(false)

  // Read from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key)
        if (item) {
          setStoredValue(deserialize<T>(item))
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        // Save state
        setStoredValue(valueToStore)
        // Save to local storage (only after mount)
        if (isMounted && typeof window !== 'undefined') {
          window.localStorage.setItem(key, serialize(valueToStore))
        }
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue, isMounted],
  )

  // Remove the key from localStorage
  const removeValue = useCallback(() => {
    try {
      if (isMounted && typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
        setStoredValue(initialValue)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue, isMounted])

  return [storedValue, setValue, removeValue] as const
}

export default useLocalStorage
