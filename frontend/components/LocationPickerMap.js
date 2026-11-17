import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// Mapa para elegir una ubicación.
// Props:
//  - region:     { latitude, longitude, latitudeDelta, longitudeDelta } (centro inicial)
//  - coordinate: { latitude, longitude } | null (marcador actual)
//  - onSelect:   (coordinate) => void, se llama al tocar el mapa o al soltar el marcador
//  - pinColor:   color del marcador
//  - style:      estilo del contenedor
export default function LocationPickerMap({ region, coordinate, onSelect, pinColor = '#AC7933', style }) {
  const mapRef = useRef(null);

  // Si cambia la región (por ejemplo, al obtener el GPS), se centra el mapa.
  useEffect(() => {
    if (region && mapRef.current) {
      mapRef.current.animateToRegion(region, 400);
    }
  }, [region?.latitude, region?.longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MapView
      ref={mapRef}
      style={[styles.map, style]}
      initialRegion={region}
      onPress={(e) => onSelect?.(e.nativeEvent.coordinate)}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}
      accessibilityLabel="Mapa para seleccionar la ubicación del lugar"
    >
      {coordinate && (
        <Marker
          coordinate={coordinate}
          pinColor={pinColor}
          draggable
          onDragEnd={(e) => onSelect?.(e.nativeEvent.coordinate)}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});