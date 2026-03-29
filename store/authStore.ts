import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import axios from 'axios'
import type { User } from '@/types'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'
const REFRESH_TOKEN_KEY = 'ev_refresh_token'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  hydrated: boolean
  setTokens: (accessToken: string, refreshToken: string, user: User) => Promise<void>
  clearAuth: () => Promise<void>
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  hydrated: false,

  setTokens: async (token, refreshToken, user) => {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
    set({ token, refreshToken, user })
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
    set({ token: null, refreshToken: null, user: null })
  },

  setHydrated: () => set({ hydrated: true }),
}))

/** Called once on app boot to restore session from SecureStore */
export async function hydrateAuth() {
  const { setTokens, setHydrated, clearAuth } = useAuthStore.getState()
  try {
    const storedRefresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
    if (!storedRefresh) return

    const res = await axios.post(
      `${BASE_URL}/auth/refresh`,
      { refreshToken: storedRefresh },
      { timeout: 10_000 }
    )
    await setTokens(res.data.accessToken, res.data.refreshToken, res.data.user)
  } catch {
    await clearAuth()
  } finally {
    setHydrated()
  }
}
