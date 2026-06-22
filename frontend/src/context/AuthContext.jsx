import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

/**
 * Stored shape in localStorage:
 * { token, userId, email, fullName, role }
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const login = useCallback((authResponse) => {
    // authResponse = { token, userId, email, fullName, role }
    localStorage.setItem('token', authResponse.token)
    localStorage.setItem('user', JSON.stringify(authResponse))
    setUser(authResponse)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
