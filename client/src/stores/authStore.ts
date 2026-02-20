import { create } from 'zustand'
import type { AuthResponse } from '../types/api'

interface AuthUser {
  userId: string
  username: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (response: AuthResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const raw = localStorage.getItem('authUser')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })(),
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),

  login: (response) => {
    const user: AuthUser = {
      userId: response.userId,
      username: response.username,
      email: response.email,
    }
    localStorage.setItem('authToken', response.token)
    localStorage.setItem('authUser', JSON.stringify(user))
    set({ user, token: response.token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
