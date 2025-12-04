import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Asset } from 'expo-asset'; 
import * as Font from 'expo-font'; 

import InputScreen from './screens/InputScreen';
import OutputScreen from './screens/OutputScreen';
import HistoryScreen from './screens/HistoryScreen'; 

const Stack = createNativeStackNavigator();

const bgImage = require('./assets/images/back_gradient.png');
const appFonts = {
  'Manrope-ExtraBold': require('./assets/fonts/Manrope-ExtraBold.ttf'),
  'Manrope-Regular': require('./assets/fonts/Manrope-Regular.ttf'),
};

// --- PRELOAD FONKSİYONU ---
async function loadAssets() {
  const imageAssets = [bgImage].map(image => Asset.fromModule(image).downloadAsync());
  const fontAssets = Font.loadAsync(appFonts);

  await Promise.all([...imageAssets, fontAssets]);
}

export default function App() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  useEffect(() => {
    async function loadApp() {
      try {
        await loadAssets();
      } catch (e) {
        // Kritik asset yükleme hatası. İnceleyen kişinin hatayı görmesi için bırakıldı.
        console.warn(e);
      } finally {
        setIsLoadingComplete(true);
      }
    }
    loadApp();
  }, []);

  if (!isLoadingComplete) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09090B' }}>
        <ActivityIndicator size="large" color="#943dff" />
        <Text style={{color: '#fafafa', marginTop: 10}}>Loading assets...</Text>
      </View>
    );
  }

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
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}