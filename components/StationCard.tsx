import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { Colors, Spacing, FontSize, BorderRadius, FontWeight, Shadow } from '@/constants/theme'
import type { ChargingStation } from '@/types'

interface Props {
  station: ChargingStation
  onPress?: () => void
  style?: ViewStyle
}

function formatDistance(meters?: number): string {
  if (!meters) return ''
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function StationCard({ station, onPress, style }: Props) {
  const availableAC = station.connectors.filter((c) => c.status === 'AVAILABLE' && c.currentType === 'AC').length
  const availableDC = station.connectors.filter((c) => c.status === 'AVAILABLE' && c.currentType === 'DC').length
  const maxPower = Math.max(...station.connectors.map((c) => c.powerKw), 0)

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top row */}
      <View style={styles.top}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{station.name}</Text>
          <Text style={styles.address} numberOfLines={1}>{station.addressLine1}, {station.city}</Text>
        </View>
        <View style={styles.right}>
          {station.distance !== undefined && (
            <Text style={styles.distance}>{formatDistance(station.distance)}</Text>
          )}
          <View style={[styles.badge, station.availablePorts > 0 ? styles.badgeAvail : styles.badgeFull]}>
            <Text style={[styles.badgeText, station.availablePorts > 0 ? styles.badgeTextAvail : styles.badgeTextFull]}>
              {station.availablePorts > 0 ? `${station.availablePorts} free` : 'Full'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom row */}
      <View style={styles.bottom}>
        {availableDC > 0 && (
          <View style={styles.connector}>
            <Text style={styles.connectorIcon}>⚡</Text>
            <Text style={styles.connectorText}>DC Fast · {maxPower}kW</Text>
          </View>
        )}
        {availableAC > 0 && (
          <View style={styles.connector}>
            <Text style={styles.connectorIcon}>🔌</Text>
            <Text style={styles.connectorText}>AC Level 2</Text>
          </View>
        )}
        {station.amenities?.includes('wifi') && (
          <View style={styles.amenity}>
            <Text style={styles.amenityText}>WiFi</Text>
          </View>
        )}
        {station.rating && (
          <View style={styles.rating}>
            <Text style={styles.ratingText}>★ {station.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm, gap: Spacing.sm },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  address: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: Spacing.xs },
  distance: { fontSize: FontSize.xs, color: Colors.textSecondary },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  badgeAvail: { backgroundColor: `${Colors.success}22` },
  badgeFull: { backgroundColor: `${Colors.error}22` },
  badgeText: { fontSize: 11, fontWeight: FontWeight.semibold },
  badgeTextAvail: { color: Colors.success },
  badgeTextFull: { color: Colors.error },
  bottom: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, alignItems: 'center' },
  connector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  connectorIcon: { fontSize: 11 },
  connectorText: { fontSize: 11, color: Colors.textSecondary },
  amenity: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  amenityText: { fontSize: 11, color: Colors.textSecondary },
  rating: {
    marginLeft: 'auto' as any,
    backgroundColor: `${Colors.warning}22`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  ratingText: { fontSize: 11, color: Colors.warning, fontWeight: FontWeight.semibold },
})
