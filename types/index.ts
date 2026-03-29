// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
  isEmailVerified: boolean
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

// ─── Station Types ────────────────────────────────────────────────────────────

export type ConnectorType = 'CCS1' | 'CCS2' | 'CHADEMO' | 'TYPE2' | 'J1772' | 'TESLA_NACS'
export type CurrentType = 'AC' | 'DC'
export type ConnectorStatus = 'AVAILABLE' | 'OCCUPIED' | 'FAULTED' | 'OFFLINE' | 'RESERVED'

export interface Connector {
  id: string
  portNumber: number
  connectorType: ConnectorType
  powerKw: number
  currentType: CurrentType
  status: ConnectorStatus
  pricePerKwh: number
  pricePerMinute?: number
  sessionFee: number
}

export interface ChargingStation {
  id: string
  name: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  latitude: number
  longitude: number
  operatorName: string
  operatorLogoUrl?: string
  amenities: string[]
  totalPorts: number
  availablePorts: number
  rating?: number
  ratingCount: number
  distance?: number // meters, only in nearby results
  connectors: Connector[]
}

// ─── QR Types ─────────────────────────────────────────────────────────────────

export interface QRPayload {
  v: number
  cid: string
  sid: string
  pn: number
  ts: number
  sig: string
}

export interface QRValidateResponse {
  connectorId: string
  stationId: string
  portNumber: number
  connectorType: ConnectorType
  powerKw: number
  pricing: {
    perKwh: number
    perMinute?: number
    sessionFee: number
    estimatedCost?: number
  }
  stationName: string
  address: string
  status: ConnectorStatus
  sessionToken: string // short-lived token to create session
}

// ─── Session Types ────────────────────────────────────────────────────────────

export type SessionStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_AUTHORIZED'
  | 'STARTING'
  | 'ACTIVE'
  | 'STOPPING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'

export interface ChargingSession {
  id: string
  userId: string
  connectorId: string
  stationId: string
  status: SessionStatus
  startedAt?: string
  endedAt?: string
  energyKwh: number
  durationMinutes: number
  totalCost: number
  stationName: string
  portNumber: number
  connectorType: ConnectorType
  powerKw: number
  payment?: Payment
}

// ─── Payment Types ────────────────────────────────────────────────────────────

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED'

export interface Payment {
  id: string
  sessionId: string
  amount: number
  currency: string
  status: PaymentStatus
  capturedAmount?: number
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number
  error: string
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
