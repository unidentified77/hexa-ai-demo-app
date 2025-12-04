import "dotenv/config";

export default {
    expo: {
      name: "hexa-ai-logo-generator",
      slug: "hexa-ai-logo-generator",
  
      // Burası önemli! Firebase config global değişken olarak buraya bırakıyoruz.
      extra: {
        firebase_config: JSON.stringify({
          apiKey: "AIzaSyBDDwoYOhZNjV9x47tWmuOBgTd0t5seeag",
          authDomain: "hexaai-63ae8.firebaseapp.com",
          projectId: "hexaai-63ae8",
          storageBucket: "hexaai-63ae8.firebasestorage.app",
          messagingSenderId: "427522068380",
          appId: "1:427522068380:web:1f9dd9734b2a65bf02c259",
          measurementId: "G-VF5CH4JWYP",
        })
      }
    },
    plugins: [ 
        "expo-asset"
    ]
  };