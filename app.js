import 'react-native-gesture-handler';
import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold_Italic } from '@expo-google-fonts/playfair-display';
import { DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

import InicioScreen from './screens/inicioScreen.js';
import BuscarScreen from './screens/buscarScreen.js';
import FavoritosScreen from './screens/favoritosScreen.js';
import LugarHistoricoScreen from './screens/lugarHistoricoScreen.js';
import ComparacionScreen from './screens/comparacionScreen.js';
import HistoriaLugarScreen from './screens/historiaLugarScreen.js';
import { C } from './theme.js';

SplashScreen.preventAutoHideAsync();

const tab = createBottomTabNavigator();
const stack = createNativeStackNavigator();

function TabsPrincipales() {
  return (
    <tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: C.amber,
        tabBarInactiveTintColor: C.brown,
        tabBarStyle: {
          backgroundColor: C.cream,
          borderTopColor: C.border,
          height: 64,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        tabBarIcon: ({ color, size }) => {
          const icons = { Inicio: 'map', Buscar: 'search', Favoritos: 'bookmark' };
          return <Feather name={icons[route.name]} size={size ?? 20} color={color} />;
        },
      })}
    >
      <tab.Screen name="Inicio" component={InicioScreen} />
      <tab.Screen name="Buscar" component={BuscarScreen} />
      <tab.Screen name="Favoritos" component={FavoritosScreen} />
    </tab.Navigator>
  );
}

export default function AppNavigator() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold_Italic,
    DMMono_500Medium,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <NavigationContainer>
        <stack.Navigator screenOptions={{ headerShown: false }}>
          <stack.Screen name="TabsPrincipales" component={TabsPrincipales} />
          <stack.Screen name="LugarHistorico" component={LugarHistoricoScreen} />
          <stack.Screen name="Comparacion" component={ComparacionScreen} />
          <stack.Screen name="HistoriaLugar" component={HistoriaLugarScreen} />
        </stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
