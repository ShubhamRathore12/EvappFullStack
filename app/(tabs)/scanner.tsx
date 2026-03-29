import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Vibration } from 'react-native'
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import { stationsService } from '@/services/stations.service'
import { useSessionStore } from '@/store/sessionStore'
import { Colors, Spacing, FontSize, BorderRadius, FontWeight } from '@/constants/theme'

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const scanLock = useRef(false)
  const setPendingQR = useSessionStore((s) => s.setPendingQR)

  // Reset scan lock when screen is focused
  useEffect(() => {
    const timer = setTimeout(() => {
      setScanned(false)
      scanLock.current = false
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const { mutate: validateQR, isPending } = useMutation({
    mutationFn: stationsService.validateQR,
    onSuccess: (data) => {
      Vibration.vibrate(100)
      setPendingQR(data)
      // Small delay so user sees success state before navigating
      setTimeout(() => {
        router.push('/payment')
        setScanned(false)
        scanLock.current = false
      }, 500)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Invalid QR code. Please try again.'
      Alert.alert('Scan Failed', msg, [
        {
          text: 'Try Again',
          onPress: () => {
            setScanned(false)
            scanLock.current = false
          },
        },
      ])
    },
  })

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanLock.current || isPending) return
    scanLock.current = true
    setScanned(true)

    // Extract payload from deep link or direct base64
    let payload = data
    try {
      const url = new URL(data)
      payload = url.searchParams.get('payload') ?? data
    } catch {
      // Not a URL, use raw data as payload
    }

    validateQR(payload)
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Camera Permission</Text>
        <Text style={styles.permText}>
          Camera access is required to scan QR codes on charging stations
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Dark overlay with cutout */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          {/* Scanner frame */}
          <View style={[styles.scanFrame, scanned && styles.scanFrameSuccess]}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Center indicator */}
            {isPending ? (
              <View style={styles.scanStatus}>
                <ActivityIndicator color={Colors.primary} size="small" />
                <Text style={styles.scanStatusText}>Validating...</Text>
              </View>
            ) : scanned ? (
              <View style={styles.scanStatus}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={[styles.scanStatusText, { color: Colors.success }]}>Found!</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <Text style={styles.hint}>Point camera at the QR code on the charging station</Text>
        </View>
      </View>

      {/* Top bar */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <View style={styles.topBarInner}>
          <Text style={styles.topBarTitle}>Scan to Charge</Text>
        </View>
      </SafeAreaView>
    </View>
  )
}

const FRAME_SIZE = 260
const CORNER_SIZE = 24
const CORNER_WIDTH = 3

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  permIcon: { fontSize: 64, marginBottom: Spacing.md },
  permTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  permText: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  permBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  permBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.black },
  overlay: { ...StyleSheet.absoluteFillObject },
  topOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  middleRow: { height: FRAME_SIZE, flexDirection: 'row' },
  sideOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrameSuccess: {},
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Colors.primary,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderTopLeftRadius: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderTopRightRadius: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderBottomLeftRadius: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderBottomRightRadius: 4 },
  scanStatus: { alignItems: 'center', gap: Spacing.xs },
  scanStatusText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  checkmark: { fontSize: 32, color: Colors.success },
  hint: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBarInner: { alignItems: 'center', padding: Spacing.md },
  topBarTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
})
