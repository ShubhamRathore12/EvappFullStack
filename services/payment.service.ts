import apiClient from './api'
import type { ChargingSession, PaymentIntentResponse } from '@/types'

export const paymentService = {
  async createSession(sessionToken: string): Promise<ChargingSession> {
    const res = await apiClient.post<ChargingSession>('/sessions', { sessionToken })
    return res.data
  },

  async createPaymentIntent(sessionId: string): Promise<PaymentIntentResponse> {
    const res = await apiClient.post<PaymentIntentResponse>('/payments/intent', { sessionId })
    return res.data
  },

  async confirmPayment(sessionId: string, paymentIntentId: string): Promise<ChargingSession> {
    const res = await apiClient.post<ChargingSession>('/payments/confirm', {
      sessionId,
      paymentIntentId,
    })
    return res.data
  },

  async getSession(sessionId: string): Promise<ChargingSession> {
    const res = await apiClient.get<ChargingSession>(`/sessions/${sessionId}`)
    return res.data
  },

  async stopSession(sessionId: string): Promise<ChargingSession> {
    const res = await apiClient.patch<ChargingSession>(`/sessions/${sessionId}/stop`)
    return res.data
  },

  async getSessionHistory(page = 1, limit = 20): Promise<{ data: ChargingSession[]; total: number }> {
    const res = await apiClient.get('/sessions/history', { params: { page, limit } })
    return res.data
  },

  async getActiveSession(): Promise<ChargingSession | null> {
    const res = await apiClient.get('/sessions/active')
    return res.data
  },
}
