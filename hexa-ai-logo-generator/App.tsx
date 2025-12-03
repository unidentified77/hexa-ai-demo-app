import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import InputScreen from './screens/InputScreen';
import OutputScreen from './screens/OutputScreen';
import HistoryScreen from './screens/HistoryScreen'; // <-- Yeni Import

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Input">
        <Stack.Screen
          name="Input"
          component={InputScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Output"
          component={OutputScreen}
          options={{ headerShown: false }}
        />
        {/* Yeni Ekran Eklendi */}
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}