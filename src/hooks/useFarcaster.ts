import { useState, useCallback, useEffect } from 'react'
import { FarcasterUser } from '@/types'

export function useFarcaster() {
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('farcaster_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error('Error parsing stored user:', err)
      }
    }
    setLoading(false)
  }, [])

  const handleSignIn = useCallback(async (data: any) => {
    try {
      const { fid, username, displayName, pfp } = data
      const user: FarcasterUser = {
        fid,
        username,
        displayName,
        pfp
      }
      setUser(user)
      localStorage.setItem('farcaster_user', JSON.stringify(user))
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error signing in:', err)
    }
  }, [])

  const handleSignOut = useCallback(() => {
    setUser(null)
    localStorage.removeItem('farcaster_user')
  }, [])

  return {
    user,
    loading,
    error,
    signIn: handleSignIn,
    signOut: handleSignOut
  }
} 