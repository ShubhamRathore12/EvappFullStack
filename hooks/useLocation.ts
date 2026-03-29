import { useState, useEffect, useCallback } from 'react'
import * as Location from 'expo-location'

export interface LocationCoords {
  latitude: number
  longitude: number
  accuracy?: number
}

export function useLocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const requestLocation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Location permission denied. Please enable location access in settings.')
        return
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? undefined,
      })
    } catch (err) {
      setError('Unable to get your location. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  return { location, error, loading, refresh: requestLocation }
}
