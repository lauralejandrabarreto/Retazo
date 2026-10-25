import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import InicioScreen from '../screens/inicioScreen';
import BuscarScreen from '../screens/buscarScreen';
import FavoritosScreen from '../screens/favoritosScreen';
import LugarHistoricoScreen from '../screens/lugarHistoricoScreen';
import ComparacionScreen from '../screens/comparacionScreen';
import HistoriaLugarScreen from '../screens/historiaLugarScreen';
import { C, F } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Navegación inferior: Inicio, Buscar y Favoritos (P-01, P-02, P-06).
function TabsPrincipales() {
  // Altura explícita + margen inferior del sistema (barra de gestos en Android/iOS).
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: C.amber,
        tabBarInactiveTintColor: C.brown,
        tabBarStyle: {
          backgroundColor: C.cream,
          borderTopColor: C.border,
          height: 60 + insets.bottom,
          paddingBottom: 6 + insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: F.sansMed },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Favoritos') {
            return <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size ?? 20} color={color} />;
          }
          const icons = { Inicio: 'map', Buscar: 'search' };
          return <Feather name={icons[route.name]} size={size ?? 20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen name="Buscar" component={BuscarScreen} />
      <Tab.Screen name="Favoritos" component={FavoritosScreen} />
    </Tab.Navigator>
  );
}

// Pila principal: las pestañas y las pantallas de detalle (P-03, P-04, P-05).
// Las pantallas de detalle reciben solo el id del lugar como parámetro.
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.parchment } }}>
      <Stack.Screen name="TabsPrincipales" component={TabsPrincipales} />
      <Stack.Screen name="LugarHistorico" component={LugarHistoricoScreen} />
      <Stack.Screen name="Comparacion" component={ComparacionScreen} />
      <Stack.Screen name="HistoriaLugar" component={HistoriaLugarScreen} />
    </Stack.Navigator>
  );
}
