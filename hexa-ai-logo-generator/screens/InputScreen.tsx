import React, { useState, useEffect, useRef } from 'react'; 
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    Dimensions,
    ImageBackground,
    StatusBar,
    ImageSourcePropType
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp, useIsFocused } from '@react-navigation/native'; 
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import Svg, { Path } from 'react-native-svg';

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

// --- GÖRSEL TANIMLAMASI ---
const bgImage = require('../assets/images/back_gradient.png');

type RootStackParamList = {
    Input: undefined;
    Output: { jobId: string }; 
    History: undefined;
};

type GenerationStatus = 'idle' | 'processing' | 'done' | 'failed';

// --- MOCK VERİLER ve Bileşenler ---
const LOGO_STYLES = [
    { id: 'none', name: 'No Style', image: null }, 
    { id: 'monogram', name: 'Monogram', image: require('../assets/images/Monogram.png') },
    { id: 'abstract', name: 'Abstract', image: require('../assets/images/Abstract.png') },
    { id: 'mascot', name: 'Mascot', image: require('../assets/images/Mascot.png') },
    { id: 'minimal', name: 'Minimal', image: require('../assets/images/Minimal.jpg') },
    { id: 'vintage', name: 'Vintage', image: require('../assets/images/Vintage.avif') },
];

interface StyleChipProps {
    styleData: (typeof LOGO_STYLES)[0];
    isSelected: boolean;
    onSelect: (id: string) => void;
}

const StyleChip: React.FC<StyleChipProps> = ({ styleData, isSelected, onSelect }) => {
    const isNoStyle = styleData.id === 'none';

    return (
        <TouchableOpacity 
            style={styles.chipWrapper}
            onPress={() => onSelect(styleData.id)}
            activeOpacity={0.8}
        >
            {/* 1. GÖRSEL KUTUSU */}
            <View style={styles.chipVisualContainer}>
                {isNoStyle ? (
                    // --- NO STYLE KUTUSU ---
                    <View style={[
                        styles.noStyleBoxBase, 
                        isSelected ? styles.selectedBorder : styles.unselectedNoStyleBorder
                    ]}>
                        <LinearGradient
                            colors={['rgba(41, 56, 220, 0.25)', 'rgba(41, 56, 220, 0.25)']}
                            style={styles.noStyleGradient}
                        >
                            <View style={styles.noStyleInnerIcon}>
                                <Text style={{fontSize: 24}}>🚫</Text>
                            </View>
                        </LinearGradient>
                    </View>
                ) : (
                    // --- RESİMLİ KUTU ---
                    <View style={[
                        styles.imageWrapper, 
                        isSelected && styles.selectedBorder // Sadece seçiliyse border ekle
                    ]}>
                        <ImageBackground
                            source={styleData.image as ImageSourcePropType}
                            style={styles.styleImageBox}
                            imageStyle={styles.styleImageRadius} 
                        />
                    </View>
                )}
            </View>

            {/* 2. METİN ALANI (Seçili olma durumuna göre stil değişir) */}
            <Text style={isSelected ? styles.chipTextSelected : styles.chipTextUnselected}>
                {styleData.name}
            </Text>
        </TouchableOpacity>
    );
};


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
        'Manrope-Regular': require('../assets/fonts/Manrope-Regular.ttf'),
    });

    const CustomSparklesIcon = () => (
        <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            {/* 1. Büyük Opak Yıldız */}
            <Path
                opacity={0.4}
                d="M8.95831 0.833374C9.30349 0.833374 9.58331 1.1132 9.58331 1.45837C9.58331 3.1301 10.4255 4.85415 11.744 6.17268C13.0625 7.49122 14.7866 8.33337 16.4583 8.33337C16.8035 8.33337 17.0833 8.6132 17.0833 8.95837C17.0833 9.30355 16.8035 9.58337 16.4583 9.58337C14.7866 9.58337 13.0625 10.4255 11.744 11.7441C10.4255 13.0626 9.58331 14.7866 9.58331 16.4584C9.58331 16.8036 9.30349 17.0834 8.95831 17.0834C8.61313 17.0834 8.33331 16.8036 8.33331 16.4584C8.33331 14.7866 7.49115 13.0626 6.17262 11.7441C4.85409 10.4255 3.13004 9.58337 1.45831 9.58337C1.11314 9.58337 0.833313 9.30355 0.833313 8.95837C0.833313 8.6132 1.11314 8.33337 1.45831 8.33337C3.13004 8.33337 4.85409 7.49122 6.17262 6.17268C7.49115 4.85415 8.33331 3.1301 8.33331 1.45837C8.33331 1.1132 8.61313 0.833374 8.95831 0.833374Z"
                fill="#FAFAFA"
            />
            {/* 2. Sağ Üst Küçük Yıldız */}
            <Path
                d="M15 0C15.1779 0 15.332 0.123284 15.3711 0.296832L15.5663 1.16334C15.6996 1.75501 16.1616 2.21706 16.7533 2.35034L17.6198 2.54553C17.7934 2.58463 17.9166 2.73877 17.9166 2.91667C17.9166 3.09456 17.7934 3.24871 17.6198 3.2878L16.7533 3.48299C16.1616 3.61627 15.6996 4.07832 15.5663 4.66999L15.3711 5.5365C15.332 5.71005 15.1779 5.83333 15 5.83333C14.8221 5.83333 14.6679 5.71005 14.6288 5.5365L14.4337 4.66999C14.3004 4.07832 13.8383 3.61627 13.2467 3.48299L12.3801 3.2878C12.2066 3.24871 12.0833 3.09456 12.0833 2.91667C12.0833 2.73877 12.2066 2.58463 12.3801 2.54553L13.2467 2.35034C13.8383 2.21706 14.3004 1.75501 14.4337 1.16335L14.6288 0.296832C14.6679 0.123284 14.8221 0 15 0Z"
                fill="#FAFAFA"
            />
            {/* 3. Sol Alt Küçük Yıldız */}
            <Path
                d="M2.91667 12.0834C3.09456 12.0834 3.24871 12.2067 3.2878 12.3802L3.48299 13.2467C3.61627 13.8384 4.07832 14.3004 4.66999 14.4337L5.5365 14.6289C5.71005 14.668 5.83333 14.8221 5.83333 15C5.83333 15.1779 5.71005 15.3321 5.5365 15.3712L4.66999 15.5664C4.07832 15.6996 3.61627 16.1617 3.48299 16.7534L3.2878 17.6199C3.24871 17.7934 3.09456 17.9167 2.91667 17.9167C2.73877 17.9167 2.58463 17.7934 2.54553 17.6199L2.35034 16.7534C2.21706 16.1617 1.75501 15.6996 1.16335 15.5664L0.296832 15.3712C0.123284 15.3321 0 15.1779 0 15C0 14.8221 0.123284 14.668 0.296832 14.6289L1.16335 14.4337C1.75501 14.3004 2.21706 13.8384 2.35034 13.2467L2.54553 12.3802C2.58463 12.2067 2.73877 12.0834 2.91667 12.0834Z"
                fill="#FAFAFA"
            />
        </Svg>
    );

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
            <View style={[styles.mainContainer, {justifyContent: 'center', alignItems: 'center'}]}>
                <ActivityIndicator size="large" color="#943dff" />
                <Text style={{color: '#fafafa', marginTop: 10}}>
                    {!fontsLoaded ? "Loading fonts..." : "Authenticating..."}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" />
            
            {/* Gradient PNG Arka Plan */}
            <ImageBackground 
                source={bgImage} 
                resizeMode="cover" 
                style={styles.backgroundImage}
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

                    {/* SCROLLVIEW: SADECE KAYAN İÇERİKLER */}
                    <ScrollView 
                        ref={scrollViewRef}
                        contentContainerStyle={[
                            styles.scrollContent,
                            showStatusDisplay && styles.scrollContentShifted 
                        ]}
                    >
                        
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
                            style={{ marginHorizontal: -24 }}
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

                    </ScrollView>

                    <View style={styles.footerContainer}>
                        <TouchableOpacity 
                            onPress={handleCreateLogo} 
                            style={[styles.createButtonWrapper, (jobStatus === 'processing' || jobStatus === 'done') && styles.createButtonDisabled]}
                            activeOpacity={0.8}
                            disabled={jobStatus === 'processing' || jobStatus === 'done' || !user}
                        >
                            <LinearGradient
                                colors={['#943DFF', '#2938DC']} 
                                locations={[0.2459, 1]} 
                                start={{ x: 1, y: 0 }}
                                end={{ x: 0, y: 0 }}
                                style={styles.createButton} 
                            >
                                <Text style={styles.createButtonText}>
                                  {jobStatus === 'processing' ? 'Processing...' : 'Create'}
                                </Text>
                                {jobStatus !== 'processing' && <CustomSparklesIcon />}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

const STATUS_HEIGHT = 70; 

const styles = StyleSheet.create({
    // --- Arka plan containerlar---
    mainContainer: {
        flex: 1,
        backgroundColor: '#09090B', // Figma: Dark-1000
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    // -------------------------------------

    headerBox: {
        height: 60,
        paddingVertical: 12, 
        alignItems: 'center',
        backgroundColor: 'transparent', 
        flexDirection: 'row', 
        justifyContent: 'center', 
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
        top: 15,
        padding: 5,
    },
    historyIcon: {
        fontSize: 24,
    },
    scrollContent: {
        paddingHorizontal: 24, 
        paddingBottom: 30 + 56 + 15, // 30 (default) + 56 (Button H) + 15 (Footer pad)
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
        color: '#FAFAFA',
        textAlign: 'left',
        fontFamily: 'Manrope-ExtraBold',
        fontSize: 20,
        fontWeight: '800',
        lineHeight: 25,
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
        textAlignVertical: 'top', 
        color: '#FAFAFA', 
        fontFamily: 'Manrope-Regular', 
        fontSize: 16, 
        fontWeight: '400', 
        lineHeight: 21,
    },
    charCount: {
        fontSize: 12,
        color: '#71717a', 
        textAlign: 'right',
        marginTop: 5,
    },
    styleGrid: {
        paddingVertical: 10,
        gap: 8,
        marginBottom: 30, 
        paddingHorizontal: 24,
    },
    
    // --- STYLE CHIP STYLES ---
    chipWrapper: {
        alignItems: 'center',
        marginRight: 0,
    },
    chipVisualContainer: {
        width: 90,
        height: 90,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    // -- SEÇİLİ OLMA DURUMU (Highlights) --
    selectedBorder: {
        borderColor: '#943DFF', // Neon Mor
        borderWidth: 3,         // Kalın Çerçeve
    },
    unselectedNoStyleBorder: {
        borderColor: '#FAFAFA', // Varsayılan Beyaz
        borderWidth: 2,
    },

    // No Style İçin Temel Kutu
    noStyleBoxBase: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        backgroundColor: '#27272A',
        overflow: 'hidden',
    },
    noStyleGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noStyleInnerIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Resimli Kutular İçin Sarmalayıcı
    imageWrapper: {
        width: '100%',
        height: '100%',
        borderRadius: 14, 
        overflow: 'hidden', 
        borderWidth: 0, 
    },
    styleImageBox: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    styleImageRadius: {
        borderRadius: 14, 
    },

    // Seçili Metin Stili
    chipTextSelected: {
        color: '#FAFAFA',
        textAlign: 'center',
        fontFamily: 'Manrope-Regular', 
        fontSize: 13,
        fontWeight: '700', 
        lineHeight: 18,
        letterSpacing: -0.13,
    },
    // Seçili Olmayan Metin Stili
    chipTextUnselected: {
        color: '#71717A',
        textAlign: 'center',
        fontFamily: 'Manrope-Regular',
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
    },
    // ---------------------------------

    // --- FOOTER STYLES ---
    footerGradientMask: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: -50, 
      height: 100,
      zIndex: 1,
    },
    footerContainer: {
      paddingHorizontal: 24, 
      paddingVertical: 15,
      zIndex: 2,
    },
    createButtonWrapper: {
      borderRadius: 50, 
      overflow: 'hidden',
      zIndex: 3, // En üstte butonu tut
    },
    createButton: {
        height: 56, 
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24, 
        gap: 8,
    },
    createButtonText: {
        color: '#FAFAFA',
        textAlign: 'center',
        fontFamily: 'Manrope-ExtraBold',
        fontSize: 17,
        fontWeight: '800',
        lineHeight: 22,
        letterSpacing: -0.17,
    },
    createButtonDisabled: {
        opacity: 0.5,
    }
});

export default InputScreen;