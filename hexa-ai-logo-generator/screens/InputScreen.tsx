import React, { useState, useEffect, useRef } from 'react'; 
import { 
    View, 
    Text, 
    TextInput, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    ImageBackground,
    StatusBar,
    ImageSourcePropType,
    Image, // <--- Image import edildi
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp, useIsFocused } from '@react-navigation/native'; 
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import Svg, { Path } from 'react-native-svg';

import { styles, STATUS_HEIGHT } from './InputScreen.styles';

import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { 
    collection, 
    addDoc, 
    doc, 
    onSnapshot, 
    serverTimestamp,
} from 'firebase/firestore'; 

import { db, auth, initialAuthToken, appId } from '../utils/firebase'; 

const bgImage = require('../assets/images/back_gradient.png');

type RootStackParamList = {
    Input: undefined;
    Output: { jobId: string }; 
    History: undefined;
};

type GenerationStatus = 'idle' | 'processing' | 'done' | 'failed';

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

// ... (NoStyleIcon, FailedIcon, CustomSparklesIcon - AYNI KALSIN) ...
// Buraya uzun olmasın diye kopyalamadım, senin kodundaki o bileşenler aynen kalsın.
const NoStyleIcon = () => (
    <View style={{ width: 33.333, height: 33.333, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={33.333} height={33.333} viewBox="0 0 37 37" fill="none" style={{ position: 'absolute' }}>
            <Path d="M18.0166 34.6833C27.2166 34.6833 34.6833 27.2166 34.6833 18.0166C34.6833 8.81664 27.2166 1.34998 18.0166 1.34998C8.81664 1.34998 1.34998 8.81664 1.34998 18.0166C1.34998 27.2166 8.81664 34.6833 18.0166 34.6833Z" stroke="#FAFAFA" strokeWidth="2.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
        <Svg width={23.333} height={23.333} viewBox="0 0 27 27" fill="none" style={{ position: 'absolute' }}>
            <Path d="M24.6833 1.34998L1.34998 24.6833" stroke="#FAFAFA" strokeWidth="2.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
    </View>
);

const FailedIcon = () => (
    <Svg width={29} height={29} viewBox="0 0 29 29" fill="none">
        <Path fillRule="evenodd" clipRule="evenodd" d="M0 14.3333C0 6.41725 6.41725 0 14.3333 0C22.2494 0 28.6667 6.41725 28.6667 14.3333C28.6667 22.2494 22.2494 28.6667 14.3333 28.6667C6.41725 28.6667 0 22.2494 0 14.3333ZM13 19.6667C13 18.9303 13.5943 18.3333 14.3274 18.3333H14.3393C15.0724 18.3333 15.6667 18.9303 15.6667 19.6667C15.6667 20.403 15.0724 21 14.3393 21H14.3274C13.5943 21 13 20.403 13 19.6667ZM13 14.3333C13 15.0697 13.597 15.6667 14.3333 15.6667C15.0697 15.6667 15.6667 15.0697 15.6667 14.3333V9C15.6667 8.26362 15.0697 7.66667 14.3333 7.66667C13.597 7.66667 13 8.26362 13 9L13 14.3333Z" fill="#FAFAFA"/>
    </Svg>
);

const CustomSparklesIcon = () => (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <Path opacity={0.4} d="M8.95831 0.833374C9.30349 0.833374 9.58331 1.1132 9.58331 1.45837C9.58331 3.1301 10.4255 4.85415 11.744 6.17268C13.0625 7.49122 14.7866 8.33337 16.4583 8.33337C16.8035 8.33337 17.0833 8.6132 17.0833 8.95837C17.0833 9.30355 16.8035 9.58337 16.4583 9.58337C14.7866 9.58337 13.0625 10.4255 11.744 11.7441C10.4255 13.0626 9.58331 14.7866 9.58331 16.4584C9.58331 16.8036 9.30349 17.0834 8.95831 17.0834C8.61313 17.0834 8.33331 16.8036 8.33331 16.4584C8.33331 14.7866 7.49115 13.0626 6.17262 11.7441C4.85409 10.4255 3.13004 9.58337 1.45831 9.58337C1.11314 9.58337 0.833313 9.30355 0.833313 8.95837C0.833313 8.6132 1.11314 8.33337 1.45831 8.33337C3.13004 8.33337 4.85409 7.49122 6.17262 6.17268C7.49115 4.85415 8.33331 3.1301 8.33331 1.45837C8.33331 1.1132 8.61313 0.833374 8.95831 0.833374Z" fill="#FAFAFA" />
        <Path d="M15 0C15.1779 0 15.332 0.123284 15.3711 0.296832L15.5663 1.16334C15.6996 1.75501 16.1616 2.21706 16.7533 2.35034L17.6198 2.54553C17.7934 2.58463 17.9166 2.73877 17.9166 2.91667C17.9166 3.09456 17.7934 3.24871 17.6198 3.2878L16.7533 3.48299C16.1616 3.61627 15.6996 4.07832 15.5663 4.66999L15.3711 5.5365C15.332 5.71005 15.1779 5.83333 15 5.83333C14.8221 5.83333 14.6679 5.71005 14.6288 5.5365L14.4337 4.66999C14.3004 4.07832 13.8383 3.61627 13.2467 3.48299L12.3801 3.2878C12.2066 3.24871 12.0833 3.09456 12.0833 2.91667C12.0833 2.73877 12.2066 2.58463 12.3801 2.54553L13.2467 2.35034C13.8383 2.21706 14.3004 1.75501 14.4337 1.16335L14.6288 0.296832C14.6679 0.123284 14.8221 0 15 0Z" fill="#FAFAFA" />
        <Path d="M2.91667 12.0834C3.09456 12.0834 3.24871 12.2067 3.2878 12.3802L3.48299 13.2467C3.61627 13.8384 4.07832 14.3004 4.66999 14.4337L5.5365 14.6289C5.71005 14.668 5.83333 14.8221 5.83333 15C5.83333 15.1779 5.71005 15.3321 5.5365 15.3712L4.66999 15.5664C4.07832 15.6996 3.61627 16.1617 3.48299 16.7534L3.2878 17.6199C3.24871 17.7934 3.09456 17.9167 2.91667 17.9167C2.73877 17.9167 2.58463 17.7934 2.54553 17.6199L2.35034 16.7534C2.21706 16.1617 1.75501 15.6996 1.16335 15.5664L0.296832 15.3712C0.123284 15.3321 0 15.1779 0 15C0 14.8221 0.123284 14.668 0.296832 14.6289L1.16335 14.4337C1.75501 14.3004 2.21706 13.8384 2.35034 13.2467L2.54553 12.3802C2.58463 12.2067 2.73877 12.0834 2.91667 12.0834Z" fill="#FAFAFA" />
    </Svg>
);

const StyleChip: React.FC<StyleChipProps> = ({ styleData, isSelected, onSelect }) => {
    const isNoStyle = styleData.id === 'none';

    return (
        <TouchableOpacity 
            style={styles.chipWrapper}
            onPress={() => onSelect(styleData.id)}
            activeOpacity={0.8}
        >
            <View style={styles.chipVisualContainer}>
                {isNoStyle ? (
                    <View style={[
                        styles.noStyleBoxBase, 
                        isSelected ? styles.selectedBorder : styles.unselectedNoStyleBorder
                    ]}>
                        <LinearGradient
                            colors={['rgba(41, 56, 220, 0.25)', 'rgba(41, 56, 220, 0.25)']}
                            style={styles.noStyleGradient}
                        >
                            <View style={styles.noStyleInnerIcon}>
                                <NoStyleIcon /> 
                            </View>
                        </LinearGradient>
                    </View>
                ) : (
                    <View style={[
                        styles.imageWrapper, 
                        isSelected && styles.selectedBorder
                    ]}>
                        <ImageBackground
                            source={styleData.image as ImageSourcePropType}
                            style={styles.styleImageBox}
                            imageStyle={styles.styleImageRadius} 
                        />
                    </View>
                )}
            </View>

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
    resultUrl: string | null;
    onTap: (jobId: string) => void;
    onRetry: () => void;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, jobId, resultUrl, onTap, onRetry }) => {
    const isProcessing = status === 'processing';
    const isDone = status === 'done';
    const isFailed = status === 'failed';
    const failTexture = require('../assets/images/failedStatus.jpg'); 

    let title = '';
    let subtitle = '';
    let icon = null;
    let solidColor = '#1C1C1E'; 

    const subtitleStyle = isProcessing ? styles.statusSubtitleProcessing : styles.statusSubtitleResult;

    if (isProcessing) {
        title = 'Creating Your Design...';
        subtitle = 'Ready in 2 minutes';
        icon = <ActivityIndicator size="small" color="#FFF" />;
    } else if (isDone) {
        title = 'Your Design is Ready';
        subtitle = 'Tap to see it.';
        solidColor = '#943dff'; 
        
        // --- RESİM VARSA GÖSTER ---
        if (resultUrl) {
            icon = (
                <Image 
                    source={{ uri: resultUrl }} 
                    style={styles.generatedLogoImage} 
                    resizeMode="cover" 
                />
            );
        } else {
            icon = <View style={styles.thumbnailBox}><Text style={styles.thumbnailText}>HEXA</Text></View>;
        }

    } else if (isFailed) {
        title = 'Oops, something went wrong!';
        subtitle = 'Click to try again.';
        icon = <FailedIcon />;
    }

    const handleAction = () => {
        if (isDone) onTap(jobId);
        else if (isFailed) onRetry();
    };
    
    const isClickable = isDone || isFailed;

    const renderTextContent = () => (
        <>
            <Text style={styles.statusTitle}>{title}</Text>
            <Text style={subtitleStyle}>{subtitle}</Text>
        </>
    );

    return (
        <TouchableOpacity 
            style={styles.statusContainer}
            onPress={isClickable ? handleAction : undefined}
            activeOpacity={isClickable ? 0.7 : 1}
        >
            {isProcessing ? (
                // --- PROCESSING ---
                <>
                    <View style={styles.leftBoxProcessing}>{icon}</View>
                    <LinearGradient
                        colors={['rgba(148, 61, 255, 0.05)', 'rgba(41, 56, 220, 0.05)']}
                        start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }} locations={[0.2459, 1]}
                        style={styles.rightBoxProcessingGradient}
                    >
                        {renderTextContent()}
                    </LinearGradient>
                </>
            ) : isFailed ? (
                // --- FAILED ---
                <>
                    <ImageBackground source={failTexture} style={styles.leftBoxFailed} resizeMode="cover">
                        <View style={styles.failedOverlay} />
                        <View style={styles.failedIconContainer}>{icon}</View>
                    </ImageBackground>
                    <View style={styles.rightBoxFailed}>
                        {renderTextContent()}
                    </View>
                </>
            ) : (
                // --- DONE ---
                <>
                    <View style={[styles.leftBoxDone]}>
                        {icon}
                    </View>

                    <LinearGradient
                        colors={['#943DFF', '#2938DC']} 
                        locations={[0.2459, 1]} 
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.rightBoxDoneGradient} // Yeni stil
                        >
                        {renderTextContent()}
                    </LinearGradient>
                </>
            )}
        </TouchableOpacity>
    );
};

const InputScreen: React.FC = () => {
    const MAX_CHAR_COUNT = 500;
    
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const isFocused = useIsFocused(); 
    const scrollViewRef = useRef<ScrollView>(null); 
    
    const [user, setUser] = useState<User | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const [prompt, setPrompt] = useState("");
    const [selectedStyleId, setSelectedStyleId] = useState('none');
    const [jobStatus, setJobStatus] = useState<GenerationStatus>('idle');
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    
    // --- YENİ STATE ---
    const [generatedLogoUrl, setGeneratedLogoUrl] = useState<string | null>(null);

    const [jobUnsubscribe, setJobUnsubscribe] = useState<(() => void) | null>(null);

    const [fontsLoaded] = useFonts({
        'Manrope-ExtraBold': require('../assets/fonts/Manrope-ExtraBold.ttf'),
        'Manrope-Regular': require('../assets/fonts/Manrope-Regular.ttf'),
    });

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
    
    useEffect(() => {
        if (isFocused && (jobStatus === 'done' || jobStatus === 'failed')) {
            handleResetState(); 
        }
    }, [isFocused]);

    useEffect(() => {
        // Auth veya User yoksa log basıp çık
        if (!isAuthReady) {
            console.log("⏳ Auth henüz hazır değil, bekleniyor...");
            return;
        }
        if (!user) {
            console.log("👤 Kullanıcı oturumu yok.");
            return;
        }
        if (!currentJobId) {
            console.log("zzZ Job ID yok, dinleme yapılmıyor.");
            return;
        }
        
        console.log(`👂 LISTENER BAŞLADI! Şu Job ID dinleniyor: ${currentJobId}`); 
        
        const userId = user.uid;
        // Doküman yolunu loglayalım ki hata varsa görelim
        const docPath = `artifacts/${appId}/users/${userId}/jobs/${currentJobId}`;
        console.log(`📂 Doküman Yolu: ${docPath}`);

        const jobRef = doc(db, `artifacts/${appId}/users/${userId}/jobs`, currentJobId);

        const unsubscribe = onSnapshot(jobRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                const newStatus = data?.status as GenerationStatus;
                const newUrl = data?.logoUrl || null; 
                
                console.log(`🔥 FIRESTORE DEĞİŞTİ!`);
                console.log(`   Durum: ${newStatus}`);
                console.log(`   URL Var mı?: ${newUrl ? 'EVET' : 'HAYIR'}`);
                
                setJobStatus(newStatus);
                setGeneratedLogoUrl(newUrl);
                
                if (newStatus === 'done' || newStatus === 'failed') {
                    console.log("🏁 İşlem tamamlandı (Done/Failed), listener kapatılıyor.");
                    if (jobUnsubscribe) {
                        jobUnsubscribe();
                        setJobUnsubscribe(null);
                    }
                }
            } else {
                console.warn("⚠️ Doküman bulunamadı! (Silinmiş olabilir)");
                setJobStatus('failed'); 
            }
        }, (error) => {
            console.error("❌ Listener içinde HATA oluştu:", error);
            setJobStatus('failed');
        });

        setJobUnsubscribe(() => unsubscribe);
        return () => {
            console.log("🛑 Listener unmount ediliyor.");
            if(unsubscribe) unsubscribe();
        };

    }, [isAuthReady, user, currentJobId]);
    
    const handleResetState = () => {
        setJobStatus('idle');
        setCurrentJobId(null);
        setGeneratedLogoUrl(null); // --- SIFIRLA ---
        if (jobUnsubscribe) {
            jobUnsubscribe();
            setJobUnsubscribe(null);
        }
    }

    const handleCreateLogo = async () => {
        console.log("🔘 'Create' Butonuna Tıklandı!");

        if (jobStatus === 'processing') {
            console.log("🚫 Zaten işlem sürüyor, tekrar basılamaz.");
            return;
        }
        if (!user) {
            console.error("🚫 Kullanıcı (user) NULL! Giriş yapılmamış.");
            return;
        }
        
        setJobStatus('processing'); 
        console.log("🔄 UI durumu 'processing' yapıldı.");
        
        try {
            console.log("🚀 Firestore'a veri hazırlanıyor...");
            
            const selectedStyleName = LOGO_STYLES.find(s => s.id === selectedStyleId)?.name || 'No Style';
            
            const payload = {
                status: 'processing',
                prompt: prompt,
                style: selectedStyleName,
                userId: user.uid, 
                createdAt: serverTimestamp(),
                logoUrl: '',
            };
            
            console.log("📦 Gönderilecek Paket:", payload);
            
            // Koleksiyon yolunu kontrol et
            const collPath = `artifacts/${appId}/users/${user.uid}/jobs`;
            console.log(`🛣️ Hedef Koleksiyon: ${collPath}`);

            const newJobRef = await addDoc(collection(db, collPath), payload);
            
            console.log(`✅ BAŞARILI! Firestore'a yazıldı. Belge ID: ${newJobRef.id}`);
            setCurrentJobId(newJobRef.id);

        } catch (error) {
            console.error("💥 PATLADI! Firestore yazma hatası:", error);
            setJobStatus('failed');
            setCurrentJobId(null);
            alert("Hata: " + (error as any).message); // Ekrana da basalım
        }
    };
    
    const handleTapResult = (jobId: string) => navigation.navigate('Output', { jobId });
    const handleRetry = () => handleCreateLogo();
    const handleSurpriseMe = () => setPrompt("A dynamic blue lion head logo in bold geometric style.");
    const handleStyleSelect = (id: string) => setSelectedStyleId(id);
    const handleViewHistory = () => navigation.navigate('History');
    
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
            <ImageBackground source={bgImage} resizeMode="cover" style={styles.backgroundImage}>
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
                                resultUrl={generatedLogoUrl}
                                onTap={handleTapResult}
                                onRetry={handleRetry}
                            />
                        </View>
                    )}

                    <ScrollView 
                        ref={scrollViewRef}
                        style={styles.scrollView}
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
                            <Text style={styles.charCount}>{prompt.length}/{MAX_CHAR_COUNT}</Text>
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
                            style={[styles.createButtonWrapper, (jobStatus === 'processing') && styles.createButtonDisabled]}
                            activeOpacity={0.8}
                            disabled={jobStatus === 'processing' || !user}
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

export default InputScreen;