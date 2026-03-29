import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentService } from '@/services/payment.service'
import { useSessionStore } from '@/store/sessionStore'
import type { SessionStatus } from '@/types'

const TERMINAL_STATUSES: SessionStatus[] = ['COMPLETED', 'FAILED', 'CANCELLED']

export function useChargingSession(sessionId: string | null) {
  const setActiveSession = useSessionStore((s) => s.setActiveSession)

  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const session = await paymentService.getSession(sessionId!)
      setActiveSession(session)
      return session
    },
    enabled: !!sessionId,
    // Poll every 5 seconds while session is active
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (!status || TERMINAL_STATUSES.includes(status)) return false
      return 5_000
    },
    staleTime: 0,
  })
}

export function useStopSession() {
  const queryClient = useQueryClient()
  const clearSession = useSessionStore((s) => s.clearSession)

  return useMutation({
    mutationFn: (sessionId: string) => paymentService.stopSession(sessionId),
    onSuccess: (data) => {
      queryClient.setQueryData(['session', data.id], data)
      if (TERMINAL_STATUSES.includes(data.status)) {
        clearSession()
      }
    },
  })
}

export function useSessionHistory() {
  return useQuery({
    queryKey: ['sessions', 'history'],
    queryFn: () => paymentService.getSessionHistory(),
    staleTime: 30_000,
  })
}
