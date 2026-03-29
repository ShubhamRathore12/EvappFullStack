import apiClient from './api'
import type { ChargingStation, QRValidateResponse } from '@/types'

export const stationsService = {
  async getNearby(lat: number, lon: number, radius = 5000, limit = 20): Promise<ChargingStation[]> {
    const res = await apiClient.get<{ data: ChargingStation[] }>('/stations/nearby', {
      params: { lat, lon, radius, limit },
    })
    return res.data.data
  },

  async getById(id: string): Promise<ChargingStation> {
    const res = await apiClient.get<ChargingStation>(`/stations/${id}`)
    return res.data
  },

  async validateQR(qrPayload: string): Promise<QRValidateResponse> {
    const res = await apiClient.post<QRValidateResponse>('/qr/validate', { qrPayload })
    return res.data
  },
}
