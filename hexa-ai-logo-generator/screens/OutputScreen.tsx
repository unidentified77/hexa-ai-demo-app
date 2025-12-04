import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,  
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, RouteProp, useRoute, NavigationProp } from '@react-navigation/native';
import { styles } from './OutputScreen.styles';
import Svg, { Path } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';

// --- FIREBASE IMPORTS ---
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 

import { app, db, auth, appId } from '../utils/firebase'; 
// --- FIREBASE IMPORTS ---

const bgImage = require('../assets/images/back_gradient.png'); 

// TypeScript için navigasyon tipleri
type RootStackParamList = {
  Input: undefined;
  Output: { jobId: string }; 
};

type OutputScreenRouteProp = RouteProp<RootStackParamList, 'Output'>;

// Job Verisi için Tip Tanımı
interface JobData {
    prompt: string;
    style: string;
    logoUrl: string;
    status: 'done' | 'failed' | 'processing';
}

// Başlangıç verisi
const INITIAL_JOB_DATA: JobData = {
    prompt: 'Loading...',
    style: 'Loading',
    logoUrl: 'https://placehold.co/400x400/333333/FFFFFF?text=LOADING',
    status: 'processing', 
};

const CopyIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M10.6666 8.60004V11.4C10.6666 13.7334 9.73325 14.6667 7.39992 14.6667H4.59992C2.26659 14.6667 1.33325 13.7334 1.33325 11.4V8.60004C1.33325 6.26671 2.26659 5.33337 4.59992 5.33337H7.39992C9.73325 5.33337 10.6666 6.26671 10.6666 8.60004Z" stroke="#A1A1AA" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M14.6666 4.60004V7.40004C14.6666 9.73337 13.7333 10.6667 11.3999 10.6667H10.6666V8.60004C10.6666 6.26671 9.73325 5.33337 7.39992 5.33337H5.33325V4.60004C5.33325 2.26671 6.26659 1.33337 8.59992 1.33337H11.3999C13.7333 1.33337 14.6666 2.26671 14.6666 4.60004Z" stroke="#A1A1AA" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const OutputScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<OutputScreenRouteProp>();
  
  const { jobId } = route.params;

  const [jobData, setJobData] = useState<JobData>(INITIAL_JOB_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // 1. Auth Kontrolü
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);


  // 2. Firestore Listener
  useEffect(() => {
    // Kullanıcı ve jobId hazırsa dinlemeyi başlat
    if (!user || !jobId) return; 

    const userId = user.uid;
    const jobRef = doc(db, `artifacts/${appId}/users/${userId}/jobs`, jobId);
    
    // Output ekranında sadece veriyi çekiyoruz (onSnapshot ile real-time)
    const unsubscribe = onSnapshot(jobRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data() as JobData;
            
            // Eğer veri geldiyse ve 'done' ise yüklenmeyi bitir
            if (data.status === 'done' || data.status === 'failed') {
                setJobData(data);
                setIsLoading(false);
            } else {
                setIsLoading(true);
                setJobData(data);
            }
        } else {
            console.error("Job document not found for output.");
            setIsLoading(false);
        }
    }, (error) => {
        console.error("Firestore listener failed on output screen:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, jobId]);

  const handleCopyPrompt = async () => {
    await Clipboard.setStringAsync(jobData.prompt);
    console.log("Prompt kopyalandı:", jobData.prompt);
  };
  
  const handleClose = () => {
      navigation.goBack();
  };
  
  const isFailed = jobData.status === 'failed';

  return (
    <ImageBackground // <-- LinearGradient yerine ImageBackground kullanıldı
      source={bgImage} 
      resizeMode="cover"
      style={styles.fullScreenContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* Başlık Çubuğu */}
        <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>Your Design</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text> 
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {isLoading && jobData.status === 'processing' ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#943dff" />
                    <Text style={styles.loadingText}>Loading design data from Firestore...</Text>
                </View>
            ) : isFailed ? (
                 <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, {color: '#EF4444'}]}>Failed to retrieve final design.</Text>
                    <Text style={styles.loadingText}>Please return to the input screen and try again.</Text>
                </View>
            ) : (
                <>
                    {/* 2. Logo Görüntüleyici Alanı */}
                    <View style={styles.logoContainer}>
                        <Image 
                            source={{ uri: jobData.logoUrl || "https://placehold.co/400x400/333333/FFFFFF?text=NO+LOGO" }}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* 3. Prompt Bilgisi Kartı */}
                    <LinearGradient
                        colors={['rgba(148, 61, 255, 0.05)', 'rgba(41, 56, 220, 0.05)']}
                        start={{ x: 1, y: 0 }} // 270 derece (Sağdan)
                        end={{ x: 0, y: 0 }}   // (Sola)
                        locations={[0.2459, 1]} // %24.59 ve %100 durakları
                        style={styles.promptCard}
                    >
                        <View style={styles.promptHeader}>
                            <Text style={styles.promptHeaderTitle}>Prompt</Text>
                            <TouchableOpacity onPress={handleCopyPrompt} style={styles.copyButton}>
                                <CopyIcon /> 
                                <Text style={styles.copyIcon}>Copy</Text> 
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.promptText}>{jobData.prompt}</Text>
                        <View style={styles.styleChip}>
                            <Text style={styles.styleChipText}>{jobData.style}</Text> 
                        </View>
                    </LinearGradient>
                </>
            )}
            
            <Text style={styles.jobInfo}>Job ID: {jobId}</Text>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>  );
};


export default OutputScreen;