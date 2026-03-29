import { create } from 'zustand'
import type { ChargingSession, QRValidateResponse } from '@/types'

interface SessionState {
  // QR scan result waiting for payment
  pendingQR: QRValidateResponse | null
  // Active charging session
  activeSession: ChargingSession | null
  setPendingQR: (qr: QRValidateResponse | null) => void
  setActiveSession: (session: ChargingSession | null) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  pendingQR: null,
  activeSession: null,

  setPendingQR: (pendingQR) => set({ pendingQR }),
  setActiveSession: (activeSession) => set({ activeSession }),
  clearSession: () => set({ pendingQR: null, activeSession: null }),
}))
