import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,  
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, RouteProp, useRoute, NavigationProp } from '@react-navigation/native';

// --- FIREBASE IMPORTS ---
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 

import { app, db, auth, appId } from '../utils/firebase'; // <-- Yeni modülden import
// --- FIREBASE IMPORTS ---

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

  const handleCopyPrompt = () => {
    console.log("Prompt kopyalandı:", jobData.prompt);
  };
  
  const handleClose = () => {
      navigation.goBack();
  };
  
  const isFailed = jobData.status === 'failed';

  return (
    <LinearGradient
      colors={['#1a1936', '#0e0e1b']} 
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
                    <View style={styles.promptCard}>
                        
                        <View style={styles.promptHeader}>
                            <Text style={styles.promptHeaderTitle}>Prompt</Text>
                            <TouchableOpacity onPress={handleCopyPrompt} style={styles.copyButton}>
                                <Text style={styles.copyIcon}>❐ Copy</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.promptText}>{jobData.prompt}</Text>

                        <View style={styles.styleChip}>
                            <Text style={styles.styleChipText}>{jobData.style}</Text> 
                        </View>
                    </View>
                </>
            )}
            
            <Text style={styles.jobInfo}>Job ID: {jobId}</Text>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 24, 
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17, 
    fontWeight: '800', 
    color: '#fafafa', 
  },
  closeButton: {
      padding: 5,
  },
  closeIcon: {
      fontSize: 24,
      color: '#fafafa',
  },
  scrollContent: {
    paddingHorizontal: 24, 
    paddingBottom: 30, 
    alignItems: 'center', 
    flexGrow: 1, 
    justifyContent: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 400, 
  },
  loadingText: {
      marginTop: 15,
      color: '#943dff',
      fontSize: 16,
      fontWeight: '600',
  },
  logoContainer: {
    width: '100%',
    aspectRatio: 1, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
      width: '90%',
      height: '90%',
  },
  promptCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fafafa',
  },
  copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  copyIcon: {
      fontSize: 14,
      color: '#943dff', 
      fontWeight: '600',
  },
  promptText: {
    fontSize: 14,
    color: '#fafafa',
    marginBottom: 12,
  },
  styleChip: {
    alignSelf: 'flex-start', 
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  styleChipText: {
    fontSize: 12,
    color: '#fafafa',
    fontWeight: '500',
  },
  jobInfo: {
      fontSize: 10,
      color: '#71717a',
      marginTop: 20,
  }
});

export default OutputScreen;