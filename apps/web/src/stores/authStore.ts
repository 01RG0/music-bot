import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

interface User {
  id: string
  discordId: string
  username: string
  discriminator: string
  avatar?: string
}

interface Guild {
  id: string
  name: string
  icon?: string
  hasBot: boolean
}

interface AuthState {
  user: User | null
  guilds: Guild[]
  selectedGuild: Guild | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null

  // Actions
  login: (code: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  setSelectedGuild: (guild: Guild | null) => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      guilds: [],
      selectedGuild: null,
      accessToken: null,
      refreshToken: null,
      isLoading: true,
      error: null,

      login: async (code: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await axios.post('/api/auth/discord/callback', { code })

          const { user, guilds, tokens } = response.data.data

          // Store tokens in localStorage for persistence
          localStorage.setItem('accessToken', tokens.accessToken)
          localStorage.setItem('refreshToken', tokens.refreshToken)

          set({
            user,
            guilds,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isLoading: false
          })
        } catch (error: any) {
          console.error('Login error:', error)
          set({
            error: error.response?.data?.error || 'Login failed',
            isLoading: false
          })
          throw error
        }
      },

      logout: () => {
        // Clear tokens from localStorage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        set({
          user: null,
          guilds: [],
          selectedGuild: null,
          accessToken: null,
          refreshToken: null,
          error: null
        })
      },

      refreshToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        try {
          const response = await axios.post('/api/auth/refresh', { refreshToken })

          const { accessToken } = response.data.data

          // Update stored tokens
          localStorage.setItem('accessToken', accessToken)

          set({ accessToken })
        } catch (error: any) {
          console.error('Token refresh error:', error)
          // If refresh fails, logout
          get().logout()
          throw error
        }
      },

      setSelectedGuild: (guild: Guild | null) => {
        set({ selectedGuild: guild })
      },

      checkAuth: async () => {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')

        if (!accessToken || !refreshToken) {
          set({ isLoading: false })
          return
        }

        try {
          // Try to get current user info
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
          })

          const { user, guilds } = response.data.data

          set({
            user,
            guilds,
            accessToken,
            refreshToken,
            isLoading: false
          })
        } catch (error: any) {
          // If access token is invalid, try refresh
          if (error.response?.status === 401) {
            try {
              await get().refreshToken()
              // Retry getting user info
              await get().checkAuth()
            } catch {
              // Refresh failed, logout
              get().logout()
            }
          } else {
            set({ isLoading: false })
          }
        }
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        guilds: state.guilds,
        selectedGuild: state.selectedGuild
      })
    }
  )
)

// Initialize auth check on app start
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth()
}

// Setup axios interceptors for automatic token refresh
axios.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken && config.url?.startsWith('/api')) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        await useAuthStore.getState().refreshToken()
        const { accessToken } = useAuthStore.getState()

        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return axios(originalRequest)
        }
      } catch {
        // Refresh failed, redirect to login
        window.location.href = '/auth'
      }
    }

    return Promise.reject(error)
  }
)
