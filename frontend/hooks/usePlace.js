import useAsync from './useAsync';
import { getPlaceById } from '../services/placesService';

// Carga un lugar a partir del parámetro de navegación `placeId`.
export default function usePlace(route) {
  const placeId = route?.params?.placeId;
  return useAsync(() => (placeId ? getPlaceById(placeId) : Promise.resolve(null)), [placeId]);
}
