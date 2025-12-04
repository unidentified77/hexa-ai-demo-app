import React, { useState, useEffect, useRef } from 'react'; 
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator, 
  Dimensions,
} from 'react-native';
import { useNavigation, NavigationProp, useIsFocused } from '@react-navigation/native'; 
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';

// --- FIREBASE IMPORTS ---
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { 
    collection, 
    addDoc, 
    doc, 
    onSnapshot, 
    serverTimestamp,
} from 'firebase/firestore'; 

import { db, auth, initialAuthToken, appId } from '../utils/firebase'; 
// --- FIREBASE IMPORTS SONU ---

type RootStackParamList = {
  Input: undefined;
  Output: { jobId: string }; 
  History: undefined;
};

type GenerationStatus = 'idle' | 'processing' | 'done' | 'failed';

// --- MOCK VERİLER ve Bileşenler ---
const LOGO_STYLES = [
  { id: 'none', name: 'No Style', icon: '🚫'},
  { id: 'monogram', name: 'Monogram', icon: '🔠'},
  { id: 'abstract', name: 'Abstract', icon: '🌌'},
  { id: 'mascot', name: 'Mascot', icon: '🐉'},
  { id: 'minimal', name: 'Minimal', icon: '🔳'},
  { id: 'vintage', name: 'Vintage', icon: '📜'},
];

interface StyleChipProps {
  styleData: (typeof LOGO_STYLES)[0];
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const StyleChip: React.FC<StyleChipProps> = ({ styleData, isSelected, onSelect }) => (
  <TouchableOpacity 
    style={[styles.chipContainer, isSelected && styles.chipSelected]}
    onPress={() => onSelect(styleData.id)}
  >
    <View style={styles.chipIconBox}>
        <Text style={styles.chipIcon}>{styleData.icon}</Text>
    </View>
    <Text style={styles.chipText}>{styleData.name}</Text>
  </TouchableOpacity>
);


// --- StatusDisplay BİLEŞENİ ---
interface StatusDisplayProps {
  status: GenerationStatus;
  jobId: string;
  onTap: (jobId: string) => void;
  onRetry: () => void;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, jobId, onTap, onRetry }) => {
  const isProcessing = status === 'processing';
  const isDone = status === 'done';
  const isFailed = status === 'failed';

  let title = '';
  let subtitle = '';
  let icon = null;
  let color = ''; 
  let iconBgColor = '';

  if (isProcessing) {
    title = 'Creating Your Design...';
    subtitle = 'Ready in 2 minutes';
    icon = <ActivityIndicator size="large" color="#fff" />; 
    color = '#1c1c1e'; 
    iconBgColor = 'transparent';
  } else if (isDone) {
    title = 'Your Design is Ready';
    subtitle = 'Tap to see it.';
    icon = <View style={styles.thumbnailBox}><Text style={styles.thumbnailText}>HEXA</Text></View>; 
    color = '#943dff'; 
    iconBgColor = '#fafafa';
  } else if (isFailed) {
    title = 'Oops, something went wrong!';
    subtitle = 'Click to try again.';
    icon = <Text style={styles.failedIcon}>!</Text>; 
    color = '#EF4444'; 
    iconBgColor = '#fafafa';
  }

  const handleAction = () => {
    if (isDone) {
      onTap(jobId);
    } else if (isFailed) {
      onRetry();
    }
  };
  
  const isClickable = isDone || isFailed;

  return (
    <TouchableOpacity 
        style={[styles.statusContainer, { backgroundColor: color }]}
        onPress={isClickable ? handleAction : undefined}
        activeOpacity={isClickable ? 0.7 : 1}
    >
      
        <View style={styles.statusIconWrapperFigma}>
            {icon}
        </View>
        <View style={styles.statusTextWrapper}>
            <Text style={styles.statusTitleFigma}>{title}</Text>
            <Text style={styles.statusSubtitleFigma}>{subtitle}</Text>
        </View>
      
    </TouchableOpacity>
  );
};
// --- StatusDisplay SONU ---


const InputScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused(); 
  const scrollViewRef = useRef<ScrollView>(null); 
  
  // State Yönetimi
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState('none');
  const [jobStatus, setJobStatus] = useState<GenerationStatus>('idle');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobUnsubscribe, setJobUnsubscribe] = useState<(() => void) | null>(null);

  const MAX_CHAR_COUNT = 500;
  
  const [fontsLoaded] = useFonts({
    'Manrope-ExtraBold': require('../assets/fonts/Manrope-ExtraBold.ttf'),
  });

  // 1. Firebase Auth ve Initialization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
            if (initialAuthToken) {
                try {
                    await signInWithCustomToken(auth, initialAuthToken);
                } catch (error) {
                    await signInAnonymously(auth);
                }
            } else {
                await signInAnonymously(auth);
            }
        }
        setUser(auth.currentUser);
        setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);
  
  // 2. İşlem Durumunu Sıfırlama
  useEffect(() => {
      if (isFocused && (jobStatus === 'done' || jobStatus === 'failed')) {
          handleResetState(); 
      }
  }, [isFocused]);


  // 3. Job Listener
  useEffect(() => {
    if (!isAuthReady || !user || !currentJobId) {
        return;
    }
    
    const userId = user.uid;
    const jobRef = doc(db, `artifacts/${appId}/users/${userId}/jobs`, currentJobId);

    const unsubscribe = onSnapshot(jobRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const newStatus = data?.status as GenerationStatus;
            
            setJobStatus(newStatus);
            console.log("Firestore Status Update:", newStatus); 
            
            if (newStatus === 'done' || newStatus === 'failed') {
                if (jobUnsubscribe) {
                    jobUnsubscribe();
                    setJobUnsubscribe(null);
                }
            }
        } else {
            console.warn("Job document does not exist anymore.");
            setJobStatus('failed'); 
        }
    }, (error) => {
        console.error("Firestore listener failed:", error);
        setJobStatus('failed');
    });

    setJobUnsubscribe(() => unsubscribe);
    return () => {
        if(unsubscribe) unsubscribe();
    };

  }, [isAuthReady, user, currentJobId]); 
  
  // --- Fonksiyonellik ---

  const handleResetState = () => {
      setJobStatus('idle');
      setCurrentJobId(null);
      if (jobUnsubscribe) {
          jobUnsubscribe();
          setJobUnsubscribe(null);
      }
  }

  const handleCreateLogo = async () => {
    if (jobStatus === 'processing' || !user) {
        console.error("Create blocked: Status is processing or user is null.");
        return; 
    }
    
    setJobStatus('processing'); 
    
    try {
        const newJobRef = await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/jobs`), {
            status: 'processing',
            prompt: prompt,
            style: LOGO_STYLES.find(s => s.id === selectedStyleId)?.name || 'No Style',
            userId: user.uid, 
            createdAt: serverTimestamp(),
            logoUrl: '',
        });
        
        setCurrentJobId(newJobRef.id);
        console.log(`İşlem başlatıldı. Job ID: ${newJobRef.id}. Firestore Yazma Başarılı.`);

    } catch (error) {
        console.error("--- KRİTİK HATA: Firestore'a Yazma Başarısız ---", error);
        setJobStatus('failed');
        setCurrentJobId(null);
    }
  };
  
  const handleTapResult = (jobId: string) => {
    navigation.navigate('Output', { jobId });
  };

  const handleRetry = () => {
    // Resetlemeden direkt başlat.
    handleCreateLogo();
  };

  const handleSurpriseMe = () => {
    const randomPrompt = "A dynamic blue lion head logo in bold geometric style.";
    setPrompt(randomPrompt);
  };
  
  const handleStyleSelect = (id: string) => {
    setSelectedStyleId(id);
  };
  
  const handleViewHistory = () => {
      navigation.navigate('History');
  };
  
  const isStatusActive = jobStatus !== 'idle';
  const showStatusDisplay = isStatusActive && currentJobId; 

  if (!fontsLoaded || !isAuthReady) {
    return (
        <View style={[styles.fullScreenContainer, {justifyContent: 'center', alignItems: 'center', backgroundColor: '#000'}]}>
            <ActivityIndicator size="large" color="#943dff" />
            <Text style={{color: '#fafafa', marginTop: 10}}>
                {!fontsLoaded ? "Loading fonts..." : "Authenticating..."}
            </Text>
        </View>
    );
  }

  return (
    <LinearGradient
      colors={['#1a1936', '#0e0e1b']} 
      style={styles.fullScreenContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>AI Logo</Text>
          <TouchableOpacity onPress={handleViewHistory} style={styles.historyButton}>
              <Text style={styles.historyIcon}>📜</Text>
          </TouchableOpacity>
        </View>

        {showStatusDisplay && (
            <View style={styles.fixedStatusContainer}>
                <StatusDisplay
                    status={jobStatus}
                    jobId={currentJobId!}
                    onTap={handleTapResult}
                    onRetry={handleRetry}
                />
            </View>
        )}

        <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={[
                styles.scrollContent,
                showStatusDisplay && styles.scrollContentShifted 
            ]}>
              
              <View style={[styles.sectionHeader, showStatusDisplay && {marginTop: 0}]}> 
                  <Text style={styles.sectionTitle}>Enter Your Prompt</Text>
                  <TouchableOpacity onPress={handleSurpriseMe} style={styles.surpriseChipContainer}>
                      <Text style={styles.surpriseIcon}>🎲</Text> 
                      <Text style={styles.surpriseText}>Surprise me</Text>
                  </TouchableOpacity>
              </View>

              <View style={styles.textAreaContainer}>
                  <TextInput
                      style={styles.textInput}
                      multiline
                      value={prompt}
                      onChangeText={setPrompt}
                      maxLength={MAX_CHAR_COUNT}
                      placeholder="A blue lion logo reading 'HEXA' in bold letters" 
                      placeholderTextColor="#71717a"
                      editable={jobStatus === 'idle' || jobStatus === 'failed'} 
                  />
                  <Text style={styles.charCount}>
                      {prompt.length}/{MAX_CHAR_COUNT}
                  </Text>
              </View>

              <Text style={styles.sectionTitle}>Logo Styles</Text>
              
              <ScrollView 
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.styleGrid}
              >
                  {LOGO_STYLES.map((style) => (
                      <StyleChip 
                          key={style.id}
                          styleData={style}
                          isSelected={selectedStyleId === style.id}
                          onSelect={handleStyleSelect}
                      />
                  ))}
              </ScrollView>

              <TouchableOpacity 
                  onPress={handleCreateLogo} 
                  style={[styles.createButtonWrapper, (jobStatus === 'processing' || jobStatus === 'done') && styles.createButtonDisabled]}
                  activeOpacity={0.8}
                  disabled={jobStatus === 'processing' || jobStatus === 'done' || !user}
              >
                  <LinearGradient
                      colors={['#943dff', '#2938dc']} 
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.createButton}
                  >
                      <Text style={styles.createButtonText}>
                        {jobStatus === 'processing' ? 'Processing...' : 'Create ✨'}
                      </Text>
                  </LinearGradient>
              </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const STATUS_HEIGHT = 70; 

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerBox: {
    height: 60,
    paddingVertical: 12, // Figma: padding: 12px 0
    alignItems: 'center',
    backgroundColor: 'transparent', 
    flexDirection: 'row', 
    justifyContent: 'center', // Başlık metnini ortalamak için 'center'
    position: 'relative', 
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontFamily:'Manrope-ExtraBold',
    fontSize: 17,
    fontWeight: '800',
    color: '#fafafa',
    lineHeight: 22,
    letterSpacing: -0.17,
  },
  historyButton: {
      position: 'absolute',
      right: 24,
      top: 50,
      padding: 5,
  },
  historyIcon: {
      fontSize: 24,
  },
  scrollContent: {
    paddingHorizontal: 24, 
    paddingBottom: 30, 
  },
  scrollContentShifted: {
      paddingTop: STATUS_HEIGHT + 15, 
  },
  fixedStatusContainer: {
    position: 'absolute',
    top: 75, 
    zIndex: 10,
    width: '100%',
    paddingHorizontal: 24, 
  },
  statusContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12, 
    gap: 15,
    height: STATUS_HEIGHT,
  },
  statusIconWrapperFigma: {
      width: 46,
      height: 46,
      borderRadius: 23, 
      backgroundColor: '#333', 
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 1, 
  },
  statusTextWrapper: {
    flex: 1,
    paddingLeft: 5,
  },
  statusTitleFigma: {
    fontSize: 14,
    fontWeight: '700', 
    color: '#fafafa',
  },
  statusSubtitleFigma: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  thumbnailBox: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#fff', 
      justifyContent: 'center',
      alignItems: 'center',
  },
  thumbnailText: {
      fontSize: 10,
      color: '#333',
  },
  failedIcon: {
      fontSize: 24,
      color: '#EF4444', 
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, 
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20, 
    fontWeight: '800', 
    color: '#fafafa',
  },
  surpriseChipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
  },
  surpriseIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  surpriseText: {
    fontSize: 13,
    color: '#fafafa',
    fontWeight: '500',
  },
  textAreaContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 150, 
    marginBottom: 30, 
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#fafafa',
    textAlignVertical: 'top', 
  },
  charCount: {
    fontSize: 12,
    color: '#71717a', 
    textAlign: 'right',
    marginTop: 5,
  },
  styleGrid: {
    paddingVertical: 10,
    gap: 12, 
    marginBottom: 30, 
  },
  chipContainer: {
    width: 90, 
    height: 110, 
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  chipSelected: {
    borderWidth: 2,
    borderColor: '#943dff', 
  },
  chipIconBox: {
      width: 60,
      height: 60,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
  },
  chipIcon: {
      fontSize: 28,
  },
  chipText: {
    fontSize: 13,
    color: '#fafafa',
    fontWeight: '500',
    textAlign: 'center',
  },
  createButtonWrapper: {
      borderRadius: 50, 
      overflow: 'hidden',
      marginTop: 20, 
  },
  createButton: {
    height: 55, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fafafa',
  },
  createButtonDisabled: {
      opacity: 0.5,
  }
});

export default InputScreen;