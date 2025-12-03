import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// --- GLOBAL FIREBASE ORTAM DEĞİŞKENLERİ ---
// App ID'si
export const appId: string = typeof __app_id !== 'undefined' ? __app_id : 'default-hexa-app'; 

// Firebase Yapılandırmasını içeren ham string
const rawFirebaseConfig: string = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';

// Auth için özel token
export const initialAuthToken: string = typeof __initial_auth_token !== 'undefined' ? __initialAuthToken : '';
// --- GLOBAL FIREBASE ORTAM DEĞİŞKENLERİ SONU ---


// --- GERÇEK FIREBASE YAPILANDIRMASI ---
let firebaseConfig: any = {};
try {
    firebaseConfig = JSON.parse(rawFirebaseConfig);
} catch (e) {
    console.error("Firebase config parsing failed, using hardcoded fallback:", e);
}

if (!firebaseConfig.projectId) {
    console.warn("Using hardcoded fallback Firebase config for hexaai-63ae8.");
    
    firebaseConfig = {
        apiKey: "AIzaSyBDDwoYOhZNjV9x47tWmuOBgTd0t5seeag",
        authDomain: "hexaai-63ae8.firebaseapp.com",
        projectId: "hexaai-63ae8",
        storageBucket: "hexaai-63ae8.firebasestorage.app",
        messagingSenderId: "427522068380",
        appId: "1:427522068380:web:1f9dd9734b2a65bf02c259",
        measurementId: "G-VF5CH4JWYP"
    };
}
// --- GERÇEK FIREBASE YAPILANDIRMASI SONU ---


// Firebase Uygulamasını ve Servislerini Başlatma (Single Instance)
export const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);