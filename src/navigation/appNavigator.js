import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import InicioScreen from '../screens/InicioScreen';
import BuscarScreen from '../screens/BuscarScreen';
import FavoritosScreen from '../screens/FavoritosScreen';
import LugarHistoricoScreen from '../screens/LugarHistoricoScreen';
import ComparacionScreen from '../screens/ComparacionScreen';
import HistoriaLugarScreen from '../screens/HistoriaLugarScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tabs inferiores: las 3 pantallas "principales" del flujo
function TabsPrincipales() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen name="Buscar" component={BuscarScreen} />
      <Tab.Screen name="Favoritos" component={FavoritosScreen} />
    </Tab.Navigator>
  );
}

// Stack general: envuelve los Tabs y agrega el flujo de detalle
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="TabsPrincipales"
          component={TabsPrincipales}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="LugarHistorico" component={LugarHistoricoScreen} />
        <Stack.Screen name="Comparacion" component={ComparacionScreen} />
        <Stack.Screen name="HistoriaLugar" component={HistoriaLugarScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}