import { useEffect } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StyleSheet } from 'react-native'
import { StripeProvider } from '@stripe/stripe-react-native'
import { useAuthStore, hydrateAuth } from '@/store/authStore'
import { Colors } from '@/constants/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
})

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

function AuthGate() {
  const { token, hydrated } = useAuthStore()
  const segments = useSegments()

  useEffect(() => {
    if (!hydrated) return
    const inAuth = segments[0] === '(auth)'
    if (!token && !inAuth) {
      router.replace('/(auth)/login')
    } else if (token && inAuth) {
      router.replace('/(tabs)')
    }
  }, [token, hydrated, segments])

  return null
}

export default function RootLayout() {
  useEffect(() => {
    hydrateAuth()
  }, [])

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <StripeProvider publishableKey={STRIPE_KEY}>
          <AuthGate />
          <StatusBar style="light" backgroundColor={Colors.background} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="payment"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                contentStyle: { backgroundColor: Colors.background },
              }}
            />
            <Stack.Screen
              name="charging/[sessionId]"
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
                contentStyle: { backgroundColor: Colors.background },
              }}
            />
          </Stack>
        </StripeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
