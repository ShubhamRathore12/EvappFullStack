import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import { useSessionHistory } from '@/hooks/useChargingSession'
import { Colors, Spacing, FontSize, BorderRadius, FontWeight } from '@/constants/theme'
import type { ChargingSession } from '@/types'

function SessionHistoryItem({ session }: { session: ChargingSession }) {
  const statusColor: Record<string, string> = {
    COMPLETED: Colors.success,
    ACTIVE: Colors.primary,
    FAILED: Colors.error,
    CANCELLED: Colors.textMuted,
  }
  return (
    <View style={styles.sessionItem}>
      <View style={styles.sessionLeft}>
        <Text style={styles.sessionStation}>{session.stationName}</Text>
        <Text style={styles.sessionMeta}>
          Port {session.portNumber} · {session.connectorType}
        </Text>
        <Text style={styles.sessionDate}>
          {session.startedAt ? format(new Date(session.startedAt), 'MMM d, yyyy · h:mm a') : 'N/A'}
        </Text>
      </View>
      <View style={styles.sessionRight}>
        <Text style={styles.sessionCost}>${session.totalCost.toFixed(2)}</Text>
        <Text style={styles.sessionKwh}>{session.energyKwh.toFixed(2)} kWh</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor[session.status] ?? Colors.textMuted}22` }]}>
          <Text style={[styles.statusText, { color: statusColor[session.status] ?? Colors.textMuted }]}>
            {session.status}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default function ProfileScreen() {
  const { user, refreshToken, clearAuth } = useAuthStore()
  const { data: history, isLoading } = useSessionHistory()

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: () => authService.logout(refreshToken ?? ''),
    onSettled: () => clearAuth(),
    onError: () => clearAuth(), // Always clear locally even if API fails
  })

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ])
  }

  const totalSpent = history?.data?.reduce((sum, s) => sum + s.totalCost, 0) ?? 0
  const totalKwh = history?.data?.reduce((sum, s) => sum + s.energyKwh, 0) ?? 0
  const totalSessions = history?.data?.length ?? 0

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={history?.data ?? []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Profile header */}
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalSessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalKwh.toFixed(1)}</Text>
                <Text style={styles.statLabel}>kWh Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>${totalSpent.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Spent</Text>
              </View>
            </View>

            {/* History header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Charging History</Text>
            </View>

            {isLoading && (
              <View style={styles.center}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>⚡</Text>
              <Text style={styles.emptyText}>No sessions yet. Start charging!</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color={Colors.error} size="small" />
            ) : (
              <Text style={styles.logoutText}>Sign Out</Text>
            )}
          </TouchableOpacity>
        }
        renderItem={({ item }) => <SessionHistoryItem session={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.black },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  profileEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  sectionHeader: { marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  sessionItem: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionLeft: { flex: 1, gap: 3 },
  sessionRight: { alignItems: 'flex-end', gap: 3 },
  sessionStation: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  sessionMeta: { fontSize: FontSize.xs, color: Colors.textSecondary },
  sessionDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  sessionCost: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  sessionKwh: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  statusText: { fontSize: 10, fontWeight: FontWeight.semibold },
  center: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.sm },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  logoutBtn: {
    backgroundColor: `${Colors.error}22`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: `${Colors.error}44`,
  },
  logoutText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.error },
})
