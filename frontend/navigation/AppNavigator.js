import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LoginScreen from '../screens/loginScreen';
import RegistroScreen from '../screens/registroScreen';
import RegistroUsuarioScreen from '../screens/registroUsuarioScreen';
import RegistroOrganizacionScreen from '../screens/registroOrganizacionScreen';
import InicioScreen from '../screens/inicioScreen';
import BuscarScreen from '../screens/buscarScreen';
import FavoritosScreen from '../screens/favoritosScreen';
import AgregarLugarScreen from '../screens/agregarLugarScreen';
import PerfilScreen from '../screens/perfilScreen';
import LugarHistoricoScreen from '../screens/lugarHistoricoScreen';
import ComparacionScreen from '../screens/comparacionScreen';
import HistoriaLugarScreen from '../screens/historiaLugarScreen';
import { useAuth } from '../context/AuthContext';
import { C, F } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Rótulo de pestaña que admite dos líneas (p. ej. "Agregar lugar histórico").
function TabLabel({ children, color, focused }) {
  return (
    <Text
      numberOfLines={2}
      style={{
        fontSize: 11, lineHeight: 14, textAlign: 'center', color,
        fontFamily: focused ? F.sansSemi : F.sansMed,
      }}
    >
      {children}
    </Text>
  );
}

const TAB_ICONS = { Inicio: 'map', Buscar: 'search', AgregarLugar: 'plus-circle', Perfil: 'user' };

// Barra inferior según el rol de la sesión:
// - usuario / invitado: Inicio, Buscar, Favoritos y Perfil (P-01, P-02, P-06).
// - organizacion:   Explorar, Agregar lugar histórico, Buscar y Perfil.
function TabsPrincipales() {
  // Altura explícita + margen inferior del sistema (barra de gestos en Android/iOS).
  const insets = useSafeAreaInsets();
  const { isOrganization } = useAuth();

  return (
    <Tab.Navigator
      key={isOrganization ? 'usuario' : 'organizacion'}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: C.amber,
        tabBarInactiveTintColor: C.brown,
        tabBarStyle: {
          backgroundColor: C.cream,
          borderTopColor: C.border,
          height: (isOrganization ? 74 : 60) + insets.bottom,
          paddingBottom: 6 + insets.bottom,
        },
        tabBarLabel: (props) => <TabLabel {...props} />,
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Favoritos') {
            return <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size ?? 20} color={color} />;
          }
          return <Feather name={TAB_ICONS[route.name]} size={size ?? 20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} options={{ title: isOrganization ? 'Explorar' : 'Inicio' }} />
      {isOrganization && (
        <Tab.Screen name="AgregarLugar" component={AgregarLugarScreen} options={{ title: 'Agregar lugar histórico' }} />
      )}
      <Tab.Screen name="Buscar" component={BuscarScreen} options={{ title: 'Buscar' }} />
      {!isOrganization && <Tab.Screen name="Favoritos" component={FavoritosScreen} options={{ title: 'Favoritos' }} />}
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

// Pila principal: inicio de sesión, registro, las pestañas y las pantallas de
// detalle (P-03, P-04, P-05). La app arranca en Login; al iniciar sesión (o
// continuar sin cuenta) se reemplaza por las pestañas, de modo que el botón de
// regreso no vuelve al formulario. Las pantallas de detalle reciben solo el id
// del lugar como parámetro.
export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.parchment } }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registro" component={RegistroScreen} />
      <Stack.Screen name="RegistroUsuario" component={RegistroUsuarioScreen} />
      <Stack.Screen name="RegistroOrganizacion" component={RegistroOrganizacionScreen} />
      <Stack.Screen name="TabsPrincipales" component={TabsPrincipales} />
      <Stack.Screen name="LugarHistorico" component={LugarHistoricoScreen} />
      <Stack.Screen name="Comparacion" component={ComparacionScreen} />
      <Stack.Screen name="HistoriaLugar" component={HistoriaLugarScreen} />
    </Stack.Navigator>
  );
}