import { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native'
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useLocation } from '@/hooks/useLocation'
import { useNearbyStations } from '@/hooks/useStations'
import { StationMarker } from '@/components/StationMarker'
import { StationCard } from '@/components/StationCard'
import { Colors, Spacing, FontSize, BorderRadius, FontWeight } from '@/constants/theme'
import type { ChargingStation } from '@/types'

export default function MapScreen() {
  const mapRef = useRef<MapView>(null)
  const [selected, setSelected] = useState<ChargingStation | null>(null)
  const { location, loading: locLoading, error: locError, refresh } = useLocation()
  const { data: stations, isLoading: stLoading } = useNearbyStations(location)

  const centerOnUser = useCallback(() => {
    if (!location) return
    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 600)
  }, [location])

  const handleMarkerPress = useCallback((station: ChargingStation) => {
    setSelected(station)
    mapRef.current?.animateToRegion({
      latitude: station.latitude,
      longitude: station.longitude,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    }, 400)
  }, [])

  if (locLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    )
  }

  if (locError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorTitle}>Location Required</Text>
        <Text style={styles.errorText}>{locError}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={darkMapStyle}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }
            : undefined
        }
        onPress={() => setSelected(null)}
      >
        {/* Search radius circle */}
        {location && (
          <Circle
            center={location}
            radius={5000}
            strokeColor="rgba(0,209,102,0.3)"
            fillColor="rgba(0,209,102,0.05)"
            strokeWidth={1}
          />
        )}

        {/* Station markers */}
        {stations?.map((station) => (
          <StationMarker
            key={station.id}
            station={station}
            selected={selected?.id === station.id}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>EV Charge</Text>
            <Text style={styles.headerSub}>
              {stLoading
                ? 'Searching nearby...'
                : `${stations?.length ?? 0} stations nearby`}
            </Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/(tabs)/stations')}>
            <Text style={styles.filterIcon}>≡</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Locate me button */}
      <TouchableOpacity style={styles.locateBtn} onPress={centerOnUser}>
        <Text style={styles.locateIcon}>◎</Text>
      </TouchableOpacity>

      {/* Station detail card */}
      {selected && (
        <View style={styles.cardWrapper}>
          <StationCard
            station={selected}
            onPress={() => {
              // Navigate to station detail / scanner
              router.push('/(tabs)/scanner')
            }}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  loadingText: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.sm },
  errorIcon: { fontSize: 48 },
  errorTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  errorText: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  retryText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.black },
  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: { fontSize: FontSize.xl, color: Colors.text },
  locateBtn: {
    position: 'absolute',
    right: Spacing.md,
    bottom: 200,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locateIcon: { fontSize: FontSize.xl, color: Colors.primary },
  cardWrapper: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.md,
    right: Spacing.md,
  },
})

// Google Maps dark style
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c54' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d3d6b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e2549' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]
