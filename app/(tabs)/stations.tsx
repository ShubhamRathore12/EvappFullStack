import { useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useLocation } from '@/hooks/useLocation'
import { useNearbyStations } from '@/hooks/useStations'
import { StationCard } from '@/components/StationCard'
import { Colors, Spacing, FontSize, BorderRadius, FontWeight } from '@/constants/theme'
import type { ChargingStation } from '@/types'

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
  { label: '25 km', value: 25000 },
]

const STATUS_FILTERS = ['All', 'Available', 'Fast Charge']

export default function StationsScreen() {
  const [radius, setRadius] = useState(5000)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')

  const { location } = useLocation()
  const { data: stations, isLoading, refetch, isRefetching } = useNearbyStations(location, radius)

  const filtered = stations?.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Available' && s.availablePorts > 0) ||
      (statusFilter === 'Fast Charge' && s.connectors.some((c) => c.currentType === 'DC'))
    return matchSearch && matchStatus
  })

  const renderItem = useCallback(
    ({ item }: { item: ChargingStation }) => (
      <StationCard
        station={item}
        onPress={() => router.push('/(tabs)/scanner')}
        style={styles.card}
      />
    ),
    []
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Stations</Text>
        <Text style={styles.subtitle}>
          {isLoading ? 'Searching...' : `${filtered?.length ?? 0} found`}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search stations, cities..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Radius filter */}
      <View style={styles.filterRow}>
        {RADIUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterChip, radius === opt.value && styles.filterChipActive]}
            onPress={() => setRadius(opt.value)}
          >
            <Text style={[styles.filterChipText, radius === opt.value && styles.filterChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status filter */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[styles.filterChipText, statusFilter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding stations near you...</Text>
        </View>
      ) : !location ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyTitle}>Location needed</Text>
          <Text style={styles.emptyText}>Enable location to find nearby stations</Text>
        </View>
      ) : filtered?.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>⚡</Text>
          <Text style={styles.emptyTitle}>No stations found</Text>
          <Text style={styles.emptyText}>Try increasing the search radius</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: FontSize.md, marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text, paddingVertical: Spacing.sm },
  clearIcon: { fontSize: FontSize.sm, color: Colors.textMuted, padding: Spacing.xs },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.black, fontWeight: FontWeight.semibold },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: { marginBottom: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  loadingText: { fontSize: FontSize.md, color: Colors.textSecondary },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
})
