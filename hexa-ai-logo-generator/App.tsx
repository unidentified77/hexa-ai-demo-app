import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import InputScreen from './screens/InputScreen';
import OutputScreen from './screens/OutputScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Input">
        <Stack.Screen
          name="Input"
          component={InputScreen}
          options={{ headerShown: false }} // <--- Bu satır navigasyon başlığını gizler
        />
        <Stack.Screen
          name="Output"
          component={OutputScreen}
          options={{ headerShown: false }} // Output ekranı için de gizleyelim
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}