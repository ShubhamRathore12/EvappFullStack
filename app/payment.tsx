import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import { useStripe } from '@stripe/stripe-react-native'
import { paymentService } from '@/services/payment.service'
import { useSessionStore } from '@/store/sessionStore'
import { Colors, Spacing, FontSize, BorderRadius, FontWeight, Shadow } from '@/constants/theme'

const CONNECTOR_ICONS: Record<string, string> = {
  CCS1: '🔌',
  CCS2: '🔌',
  CHADEMO: '⚡',
  TYPE2: '🔌',
  J1772: '🔌',
  TESLA_NACS: '⚡',
}

export default function PaymentScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe()
  const { pendingQR, setActiveSession } = useSessionStore()
  const [loading, setLoading] = useState(false)

  if (!pendingQR) {
    router.back()
    return null
  }

  const {
    stationName,
    address,
    portNumber,
    connectorType,
    powerKw,
    pricing,
    status,
    sessionToken,
  } = pendingQR

  const isAvailable = status === 'AVAILABLE'

  const { mutate: startCharging } = useMutation({
    mutationFn: async () => {
      setLoading(true)
      // 1. Create session
      const session = await paymentService.createSession(sessionToken)
      // 2. Get payment intent
      const intent = await paymentService.createPaymentIntent(session.id)
      // 3. Initialize Stripe payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'EV Charge',
        paymentIntentClientSecret: intent.clientSecret,
        defaultBillingDetails: {},
        appearance: {
          colors: {
            primary: Colors.primary,
            background: Colors.card,
            componentBackground: Colors.surface,
            componentText: Colors.text,
            primaryText: Colors.text,
            secondaryText: Colors.textSecondary,
            placeholderText: Colors.textMuted,
          },
        },
      })

      if (initError) throw new Error(initError.message)

      // 4. Present payment sheet
      const { error: payError } = await presentPaymentSheet()
      if (payError) {
        if (payError.code === 'Canceled') return null
        throw new Error(payError.message)
      }

      // 5. Confirm payment + activate charger
      const updatedSession = await paymentService.confirmPayment(session.id, intent.paymentIntentId)
      setActiveSession(updatedSession)
      return updatedSession
    },
    onSuccess: (session) => {
      setLoading(false)
      if (!session) return
      router.replace(`/charging/${session.id}`)
    },
    onError: (err: any) => {
      setLoading(false)
      const msg = err?.message ?? 'Payment failed. Please try again.'
      Alert.alert('Payment Failed', msg)
    },
  })

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Ready to Charge</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Station info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.connectorIcon}>{CONNECTOR_ICONS[connectorType] ?? '⚡'}</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.stationName}>{stationName}</Text>
              <Text style={styles.address}>{address}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.details}>
            <DetailRow label="Port" value={`#${portNumber}`} />
            <DetailRow label="Connector" value={connectorType} />
            <DetailRow label="Power" value={`${powerKw} kW`} highlight />
            <DetailRow
              label="Status"
              value={isAvailable ? 'Available' : 'In Use'}
              valueColor={isAvailable ? Colors.success : Colors.warning}
            />
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pricing</Text>
          <View style={styles.pricingRow}>
            <View style={styles.priceItem}>
              <Text style={styles.priceValue}>${pricing.perKwh.toFixed(3)}</Text>
              <Text style={styles.priceLabel}>per kWh</Text>
            </View>
            {pricing.perMinute && (
              <View style={styles.priceItem}>
                <Text style={styles.priceValue}>${pricing.perMinute.toFixed(3)}</Text>
                <Text style={styles.priceLabel}>per min</Text>
              </View>
            )}
            {pricing.sessionFee > 0 && (
              <View style={styles.priceItem}>
                <Text style={styles.priceValue}>${pricing.sessionFee.toFixed(2)}</Text>
                <Text style={styles.priceLabel}>session fee</Text>
              </View>
            )}
          </View>
          <View style={styles.authInfo}>
            <Text style={styles.authText}>
              💳 A $25.00 authorization hold will be placed on your card. You'll only be charged for actual usage.
            </Text>
          </View>
        </View>

        {/* Important notes */}
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            ⚡ Charging begins immediately after payment confirmation. Tap Stop on the next screen to end your session.
          </Text>
        </View>
      </ScrollView>

      {/* Pay button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, (!isAvailable || loading) && styles.payBtnDisabled]}
          onPress={() => startCharging()}
          disabled={!isAvailable || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.black} size="small" />
          ) : (
            <>
              <Text style={styles.payBtnText}>
                {isAvailable ? 'Pay & Start Charging' : 'Port Not Available'}
              </Text>
              <Text style={styles.payBtnSub}>Secure payment via Stripe</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

function DetailRow({
  label,
  value,
  highlight,
  valueColor,
}: {
  label: string
  value: string
  highlight?: boolean
  valueColor?: string
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && styles.detailHighlight, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: { fontSize: FontSize.md, color: Colors.text },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  connectorIcon: { fontSize: 40 },
  cardInfo: { flex: 1 },
  stationName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  address: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing.md },
  details: { gap: Spacing.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  detailValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  detailHighlight: { color: Colors.primary, fontSize: FontSize.lg },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.md },
  pricingRow: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  priceItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    minWidth: 90,
  },
  priceValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  priceLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  authInfo: {
    marginTop: Spacing.md,
    backgroundColor: `${Colors.info}15`,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  authText: { fontSize: FontSize.xs, color: Colors.info, lineHeight: 18 },
  noteCard: {
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  noteText: { fontSize: FontSize.sm, color: Colors.primary, lineHeight: 20 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  payBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.lg,
  },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.black },
  payBtnSub: { fontSize: FontSize.xs, color: Colors.black, opacity: 0.7, marginTop: 2 },
})
