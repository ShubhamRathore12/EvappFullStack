import { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated'
import { useChargingSession, useStopSession } from '@/hooks/useChargingSession'
import { useSessionStore } from '@/store/sessionStore'
import { Colors, Spacing, FontSize, BorderRadius, FontWeight, Shadow } from '@/constants/theme'
import type { SessionStatus } from '@/types'

const STATUS_LABELS: Record<SessionStatus, string> = {
  PENDING_PAYMENT: 'Pending Payment',
  PAYMENT_AUTHORIZED: 'Authorized',
  STARTING: 'Starting...',
  ACTIVE: 'Charging',
  STOPPING: 'Stopping...',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
}

const STATUS_COLORS: Record<SessionStatus, string> = {
  PENDING_PAYMENT: Colors.warning,
  PAYMENT_AUTHORIZED: Colors.info,
  STARTING: Colors.primary,
  ACTIVE: Colors.primary,
  STOPPING: Colors.warning,
  COMPLETED: Colors.success,
  FAILED: Colors.error,
  CANCELLED: Colors.textMuted,
}

function PulsingIndicator({ color }: { color: string }) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.3, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
      true
    )
    opacity.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
      true
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <Animated.View style={[styles.pulse, { backgroundColor: color }, style]} />
  )
}

export default function ChargingScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const clearSession = useSessionStore((s) => s.clearSession)

  const { data: session, isLoading } = useChargingSession(sessionId)
  const { mutate: stopSession, isPending: isStopping } = useStopSession()

  const isActive = session?.status === 'ACTIVE' || session?.status === 'STARTING'
  const isTerminal = ['COMPLETED', 'FAILED', 'CANCELLED'].includes(session?.status ?? '')

  const statusColor = STATUS_COLORS[session?.status ?? 'ACTIVE']

  const handleStop = () => {
    Alert.alert('Stop Charging', 'Are you sure you want to stop charging?', [
      { text: 'Keep Charging', style: 'cancel' },
      {
        text: 'Stop',
        style: 'destructive',
        onPress: () => stopSession(sessionId),
      },
    ])
  }

  const handleDone = () => {
    clearSession()
    router.replace('/(tabs)')
  }

  if (isLoading || !session) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Connecting to charger...</Text>
      </View>
    )
  }

  const durationMins = session.durationMinutes
  const hours = Math.floor(durationMins / 60)
  const mins = durationMins % 60

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Status indicator */}
      <View style={styles.statusSection}>
        {isActive && <PulsingIndicator color={statusColor} />}
        <View style={[styles.statusCircle, { borderColor: statusColor }]}>
          <Text style={styles.statusEmoji}>
            {isActive ? '⚡' : isTerminal ? (session.status === 'COMPLETED' ? '✓' : '✕') : '◌'}
          </Text>
        </View>
        <Text style={[styles.statusLabel, { color: statusColor }]}>
          {STATUS_LABELS[session.status]}
        </Text>
        {session.status === 'STARTING' && (
          <Text style={styles.startingHint}>Activating charger, please wait...</Text>
        )}
      </View>

      {/* Metrics */}
      <View style={styles.metricsGrid}>
        <MetricCard
          icon="⚡"
          value={`${session.energyKwh.toFixed(2)}`}
          unit="kWh"
          label="Energy Delivered"
        />
        <MetricCard
          icon="⏱️"
          value={hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
          unit=""
          label="Duration"
        />
        <MetricCard
          icon="💰"
          value={`$${session.totalCost.toFixed(2)}`}
          unit=""
          label="Current Cost"
        />
        <MetricCard
          icon="⚡"
          value={`${session.connectorType ? session.powerKw : '--'}`}
          unit="kW"
          label="Power Rate"
        />
      </View>

      {/* Session info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoStation}>{session.stationName}</Text>
        <Text style={styles.infoPort}>Port #{session.portNumber} · {session.connectorType}</Text>
        {session.startedAt && (
          <Text style={styles.infoTime}>
            Started at {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>

      {/* Action button */}
      <View style={styles.actions}>
        {isTerminal ? (
          <>
            {session.status === 'COMPLETED' && (
              <View style={styles.completedCard}>
                <Text style={styles.completedTitle}>Session Complete</Text>
                <Text style={styles.completedAmount}>
                  Total charged: ${session.totalCost.toFixed(2)}
                </Text>
                <Text style={styles.completedKwh}>
                  {session.energyKwh.toFixed(2)} kWh delivered
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneBtnText}>
                {session.status === 'COMPLETED' ? 'Done' : 'Back to Map'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.stopBtn, (isStopping || !isActive) && styles.stopBtnDisabled]}
            onPress={handleStop}
            disabled={isStopping || !isActive}
            activeOpacity={0.8}
          >
            {isStopping ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Text style={styles.stopBtnIcon}>⏹</Text>
                <Text style={styles.stopBtnText}>Stop Charging</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

function MetricCard({ icon, value, unit, label }: { icon: string; value: string; unit: string; label: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricValue}>
        {value}
        {unit && <Text style={styles.metricUnit}> {unit}</Text>}
      </Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { fontSize: FontSize.md, color: Colors.textSecondary },
  statusSection: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.md },
  pulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  statusCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  statusEmoji: { fontSize: 40 },
  statusLabel: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  startingHint: { fontSize: FontSize.sm, color: Colors.textSecondary },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricIcon: { fontSize: FontSize.xl },
  metricValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  metricUnit: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.regular },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  infoStation: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  infoPort: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoTime: { fontSize: FontSize.xs, color: Colors.textMuted },
  actions: { gap: Spacing.md },
  stopBtn: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.md,
  },
  stopBtnDisabled: { opacity: 0.5 },
  stopBtnIcon: { fontSize: FontSize.xl },
  stopBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  completedCard: {
    backgroundColor: `${Colors.success}15`,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.success}40`,
    gap: Spacing.xs,
  },
  completedTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.success },
  completedAmount: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
  completedKwh: { fontSize: FontSize.sm, color: Colors.textSecondary },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  doneBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.black },
})
