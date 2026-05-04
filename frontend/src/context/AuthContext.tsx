'use client'

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { authAPI } from '@/lib/api-client'

export interface User {
  id: string
  name: string
  email: string
  role: string
  headline?: string | null
  institution?: string | null
  profilePhoto?: string | null
  connections?: number
  connectionCount?: number
  postCount?: number
  bio?: string | null
  interests?: string[]
  skills?: string[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: Dispatch<SetStateAction<User | null>>
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; role: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useLayoutEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setIsLoading(false)
      return
    }

    authAPI
      .me()
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
  }

  const register = async (registerData: {
    name: string
    email: string
    password: string
    role: string
  }) => {
    const { data } = await authAPI.register(registerData)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await authAPI.logout(refreshToken).catch(() => {})
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  if (isLoading) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: false,
        setUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
