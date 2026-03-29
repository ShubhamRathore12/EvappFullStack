import apiClient from './api'
import type { AuthTokens, LoginPayload, SignupPayload } from '@/types'

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const res = await apiClient.post<AuthTokens>('/auth/login', payload)
    return res.data
  },

  async signup(payload: SignupPayload): Promise<AuthTokens> {
    const res = await apiClient.post<AuthTokens>('/auth/register', payload)
    return res.data
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken })
  },

  async getMe() {
    const res = await apiClient.get('/auth/me')
    return res.data
  },
}
