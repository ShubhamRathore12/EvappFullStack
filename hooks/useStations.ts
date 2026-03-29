import { useQuery } from '@tanstack/react-query'
import { stationsService } from '@/services/stations.service'
import type { LocationCoords } from './useLocation'

export function useNearbyStations(location: LocationCoords | null, radius = 5000) {
  return useQuery({
    queryKey: ['stations', 'nearby', location?.latitude, location?.longitude, radius],
    queryFn: () => stationsService.getNearby(location!.latitude, location!.longitude, radius),
    enabled: !!location,
    staleTime: 60_000, // Cache for 60s - stations don't change often
    refetchInterval: 120_000, // Background refresh every 2 mins
  })
}

export function useStation(id: string) {
  return useQuery({
    queryKey: ['stations', id],
    queryFn: () => stationsService.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}
