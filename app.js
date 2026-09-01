import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import 'react-native-gesture-handler';

import InicioScreen from './screens/inicioScreen.js';
import BuscarScreen from './screens/buscarScreen.js';
import FavoritosScreen from './screens/favoritosScreen.js';
import LugarHistoricoScreen from './screens/lugarHistoricoScreen.js';
import ComparacionScreen from './screens/comparacionScreen.js';
import HistoriaLugarScreen from './screens/historiaLugarScreen.js';

const tab = createBottomTabNavigator();
const stack = createNativeStackNavigator();

function TabsPrincipales() {
  return (
    <tab.Navigator>
      <tab.Screen name="Inicio" component={InicioScreen} />
      <tab.Screen name="Buscar" component={BuscarScreen} />
      <tab.Screen name="Favoritos" component={FavoritosScreen} />
    </tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <stack.Navigator>
        <stack.Screen
          name="TabsPrincipales"
          component={TabsPrincipales}
          options={{ headerShown: false }}
        />
        <stack.Screen name="LugarHistorico" component={LugarHistoricoScreen} />
        <stack.Screen name="Comparacion" component={ComparacionScreen} />
        <stack.Screen name="HistoriaLugar" component={HistoriaLugarScreen} />
      </stack.Navigator>
    </NavigationContainer>
  );
}
