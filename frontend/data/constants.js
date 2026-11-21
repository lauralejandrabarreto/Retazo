// Constantes de la interfaz (no son datos de lugares ni de periodos: esos vienen de la API).

export const MAP_BACKGROUND =
  'https://images.unsplash.com/photo-1568632234165-47bb34c35708?w=900&h=500&fit=crop&auto=format';

// Ubicación de respaldo (centro de Bogotá). Solo se usa cuando el usuario niega el
// permiso de ubicación o el GPS falla (ver hooks/useUserLocation.js).
export const SIMULATED_LOCATION = {
  label: 'Bogotá, Colombia',
  coords: { lat: 4.5990, lng: -74.0745 },
};