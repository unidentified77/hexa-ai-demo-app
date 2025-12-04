import "dotenv/config";

export default {
  expo: {
    name: "hexa-ai-logo-generator",
    slug: "hexa-ai-logo-generator",
    
    extra: {
      firebase_config: JSON.stringify({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      })
    }
  },
  plugins: [ 
      "expo-asset"
  ]
};