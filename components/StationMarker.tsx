import { memo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Marker } from 'react-native-maps'
import { Colors, BorderRadius, FontSize, FontWeight } from '@/constants/theme'
import type { ChargingStation } from '@/types'

interface Props {
  station: ChargingStation
  selected: boolean
  onPress: (station: ChargingStation) => void
}

export const StationMarker = memo(({ station, selected, onPress }: Props) => {
  const hasAvailable = station.availablePorts > 0
  const hasDC = station.connectors.some((c) => c.currentType === 'DC')

  return (
    <Marker
      coordinate={{ latitude: station.latitude, longitude: station.longitude }}
      onPress={() => onPress(station)}
      tracksViewChanges={false}
    >
      <View style={[styles.marker, selected && styles.markerSelected, !hasAvailable && styles.markerUnavailable]}>
        <Text style={styles.icon}>{hasDC ? '⚡' : '🔌'}</Text>
        {selected && (
          <Text style={styles.label}>{station.availablePorts}/{station.totalPorts}</Text>
        )}
      </View>
    </Marker>
  )
})

const styles = StyleSheet.create({
  marker: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  markerSelected: {
    width: 52,
    height: 52,
    borderWidth: 3,
  },
  markerUnavailable: {
    backgroundColor: Colors.textMuted,
    shadowColor: Colors.textMuted,
  },
  icon: { fontSize: 18 },
  label: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
})
