import { createContext, useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../config/supabaseClient'

export const AuthContext = createContext(undefined)

const PROFILE_FETCH_TIMEOUT_MS = 10000

function withTimeout(promise, ms, timeoutMessage) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId))
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Bumped on every auth event so an in-flight profile lookup from a
  // superseded event can recognize it's stale and discard its own result
  // instead of overwriting state set by a newer one.
  const requestIdRef = useRef(0)

  const loadAdminProfile = useCallback(async (currentSession) => {
    const requestId = ++requestIdRef.current
    setAuthError(null)

    if (!currentSession?.user) {
      setAdmin(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await withTimeout(
        supabase.from('admins').select('id, email, full_name').eq('id', currentSession.user.id).maybeSingle(),
        PROFILE_FETCH_TIMEOUT_MS,
        'Timed out checking admin access. Check your connection and try again.'
      )

      if (requestId !== requestIdRef.current) return // a newer auth event superseded this one

      if (error || !data) {
        await supabase.auth.signOut()
        setSession(null)
        setAdmin(null)
        if (error) setAuthError('Could not verify admin access. Please try again.')
        return
      }

      setAdmin(data)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setAuthError(err.message || 'Something went wrong while checking your session.')
      setAdmin(null)
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    // supabase-js fires this callback once immediately on subscribe with the
    // current session (or null), then again on every change after that — so
    // this single listener is the one source of truth for session state.
    // A separate supabase.auth.getSession() call on mount is intentionally
    // skipped here: running both was racing against this listener and
    // occasionally left the admin profile load in an inconsistent state.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(true)
      loadAdminProfile(newSession)
    })

    return () => subscription.unsubscribe()
  }, [loadAdminProfile])

  const signIn = async (email, password) => {
    setAuthError(null)
    const { error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      PROFILE_FETCH_TIMEOUT_MS,
      'Sign-in timed out. Check your connection and try again.'
    )
    if (error) throw error
    // onAuthStateChange picks up the new session and loads the admin profile.
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setAdmin(null)
  }

  const value = {
    session,
    admin,
    isAdmin: Boolean(admin),
    loading,
    authError,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
