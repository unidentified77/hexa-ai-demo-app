import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

declare const __app_id: string | undefined;
declare const __initial_auth_token: string | undefined;

// --- GLOBAL DEĞİŞKENLER ---
export const appId: string = typeof __app_id !== 'undefined' ? __app_id : 'default-hexa-app'; 

const rawFirebaseConfig: string =
    Constants.expoConfig?.extra?.firebase_config ?? '{}';

export const initialAuthToken: string = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : '';

// --- CONFIG PARSING ---
let firebaseConfig: any = {};
try {
    firebaseConfig = JSON.parse(rawFirebaseConfig);
} catch (e) {
    console.error("Firebase config parsing failed:", e);
}

// --- APP INIT (Singleton Pattern) ---
let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    
    try {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage)
        });
    } catch (e) {
        auth = getAuth(app);
    }
} else {
    app = getApp();
    auth = getAuth(app);
}

const db: Firestore = getFirestore(app);

export { app, db, auth };