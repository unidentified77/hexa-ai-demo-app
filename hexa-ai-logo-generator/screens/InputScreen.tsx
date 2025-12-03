import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator, 
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// TypeScript için navigasyon tipi tanımlaması ve Durum Enum'u
type RootStackParamList = {
  Input: undefined;
  Output: { jobId: string }; 
};

// Üretim Durumları
type GenerationStatus = 'idle' | 'processing' | 'done' | 'failed';

// --- MOCK VERİLER ve Bileşenler ---
const LOGO_STYLES = [
  { id: 'none', name: 'No Style', icon: '🚫' },
  { id: 'monogram', name: 'Monogram', icon: '🔠' },
  { id: 'abstract', name: 'Abstract', icon: '🌌' },
  { id: 'mascot', name: 'Mascot', icon: '🐉' },
  { id: 'minimal', name: '🔳', icon: '🔳' },
  { id: 'vintage', name: 'Vintage', icon: '📜' },
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

// --- YENİ BİLEŞEN: StatusDisplay (Durum Göstergesi) ---
interface StatusDisplayProps {
  status: GenerationStatus;
  jobId: string;
  onTap: (jobId: string) => void;
  onRetry: () => void;
  // Başarılı durumda gösterilecek mock logo URL'si
  mockLogoUrl?: string; 
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, jobId, onTap, onRetry, mockLogoUrl }) => {
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
    icon = <ActivityIndicator size="small" color="#fafafa" />;
    color = '#1c1c1e'; // Koyu gri arka plan
    iconBgColor = 'transparent';
  } else if (isDone) {
    title = 'Your Design is Ready';
    subtitle = 'Tap to see it.';
    // Mock logo görseli veya yer tutucu
    icon = <View style={styles.mockLogoThumb}><Text style={{fontSize: 8}}>HEXA</Text></View>; 
    color = '#943dff'; // Mor arka plan
    iconBgColor = '#fafafa';
  } else if (isFailed) {
    title = 'Oops, something went wrong!';
    subtitle = 'Click to try again.';
    icon = <Text style={styles.failedIcon}>!</Text>; // Beyaz ünlem işareti
    color = '#EF4444'; // Kırmızı arka plan
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
      
        <View style={[styles.statusIconWrapper, { backgroundColor: iconBgColor }]}>
            {icon}
        </View>
        <View style={styles.statusTextWrapper}>
            <Text style={styles.statusTitle}>{title}</Text>
            <Text style={styles.statusSubtitle}>{subtitle}</Text>
        </View>
      
    </TouchableOpacity>
  );
};
// --- StatusDisplay SONU ---


const InputScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // State Yönetimi
  const [prompt, setPrompt] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState('none');
  const [jobStatus, setJobStatus] = useState<GenerationStatus>('idle');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const MAX_CHAR_COUNT = 500;
  
  // --- Fonksiyonellik ---

  const handleCreateLogo = async () => {
    if (jobStatus === 'processing') return; // Zaten işleniyorsa engelle

    setJobStatus('processing'); 
    
    // Gerçekte: Firestore'a yazılacak
    const newJobId = `job-${Date.now()}`; 
    setCurrentJobId(newJobId);
    
    console.log(`İşlem başlatıldı: ${newJobId}. Geliştirme süresi 2-4 saniye.`);

    // MOCK Gecikme Süresi: 2-4 saniyeye düşürüldü
    const mockDelay = Math.random() * (4000 - 2000) + 2000; 
    
    setTimeout(() => {
        // Mock Başarısızlık/Başarı
        const success = Math.random() > 0.2; 

        if (success) {
            setJobStatus('done');
        } else {
            setJobStatus('failed');
        }
    }, mockDelay); 
  };
  
  const handleTapResult = (jobId: string) => {
    // Output Ekranına Gitme
    navigation.navigate('Output', { jobId });
  };

  const handleRetry = () => {
    // Hata durumunda yeniden deneme
    setJobStatus('idle');
    setCurrentJobId(null);
  };

  const handleSurpriseMe = () => {
    const randomPrompt = "A dynamic blue lion head logo in bold geometric style.";
    setPrompt(randomPrompt);
  };
  
  const handleStyleSelect = (id: string) => {
    setSelectedStyleId(id);
  };
  
  // Formun ne kadar aşağı itileceğini belirler
  const isStatusActive = jobStatus !== 'idle';

  return (
    <LinearGradient
      colors={['#1a1936', '#0e0e1b']} 
      style={styles.fullScreenContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* Başlık (AI Logo) */}
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>AI Logo</Text>
        </View>

        {/* Status Chip (Başlık ile Form arasında yer alır) */}
        {isStatusActive && currentJobId && (
            <View style={styles.fixedStatusContainer}>
                <StatusDisplay
                    status={jobStatus}
                    jobId={currentJobId}
                    onTap={handleTapResult}
                    onRetry={handleRetry}
                />
            </View>
        )}

        {/* Ana İçerik Kaydırılabilir Alan */}
        {/* Form içeriği, Status'a göre aşağı itilir (paddingTop ile) */}
        <ScrollView contentContainerStyle={[
            styles.scrollContent,
            // StatusDisplay aktifse, ona yer açmak için üstten boşluk bırakılır
            isStatusActive && styles.scrollContentShifted
        ]}>
              
              {/* Form Alanları (IDLE Durumunda da Görünür) */}
              
              {/* 1. Prompt Giriş Alanı */}
              <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Enter Your Prompt</Text>
                  <TouchableOpacity onPress={handleSurpriseMe} style={styles.surpriseChipContainer}>
                      <Text style={styles.surpriseIcon}>🎲</Text> 
                      <Text style={styles.surpriseText}>Surprise me</Text>
                  </TouchableOpacity>
              </View>

              {/* Prompt Text Input */}
              <View style={styles.textAreaContainer}>
                  <TextInput
                      style={styles.textInput}
                      multiline
                      value={prompt}
                      onChangeText={setPrompt}
                      maxLength={MAX_CHAR_COUNT}
                      placeholder="A blue lion logo reading 'HEXA' in bold letters" 
                      placeholderTextColor="#71717a"
                      editable={jobStatus === 'idle' || jobStatus === 'failed'} // İşlenirken düzenleme engellenir
                  />
                  <Text style={styles.charCount}>
                      {prompt.length}/{MAX_CHAR_COUNT}
                  </Text>
              </View>

              {/* 2. Logo Styles Alanı */}
              <Text style={styles.sectionTitle}>Logo Styles</Text>
              
              {/* Stil Seçim Izgarası (Yatay Kaydırılabilir) */}
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

              {/* CREATE DÜĞMESİ */}
              <TouchableOpacity 
                  onPress={handleCreateLogo} 
                  style={[styles.createButtonWrapper, (jobStatus === 'processing' || jobStatus === 'done') && styles.createButtonDisabled]}
                  activeOpacity={0.8}
                  disabled={jobStatus === 'processing' || jobStatus === 'done'}
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

// --- STYLES ---

const STATUS_HEIGHT = 80; // StatusDisplay'in tahmini yüksekliği

const styles = StyleSheet.create({
  // Genel Kapsayıcılar
  fullScreenContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  
  // Üst Başlık
  headerBox: {
    paddingTop: 50, 
    paddingBottom: 12,
    alignItems: 'center',
    backgroundColor: 'transparent', 
  },
  headerTitle: {
    fontSize: 17, 
    fontWeight: '800', 
    color: '#fafafa', 
  },
  
  // Form/Scroll İçeriği
  scrollContent: {
    paddingHorizontal: 24, 
    paddingBottom: 30, 
  },
  // StatusDisplay aktif olduğunda ScrollView'ı aşağı itme stili
  scrollContentShifted: {
      paddingTop: STATUS_HEIGHT + 15, // StatusDisplay yüksekliği + biraz boşluk
  },

  // Status Display (Yeni Konum)
  fixedStatusContainer: {
    position: 'absolute',
    top: 90, // HeaderBox'ın altından başlar (50+12+28 boşluk tahmini)
    zIndex: 10,
    width: '100%',
    paddingHorizontal: 24, // MainContainer ile aynı padding
  },
  
  // StatusDisplay Stilleri
  statusContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 15,
    height: STATUS_HEIGHT,
  },
  statusIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: 'rgba(0,0,0,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  statusTextWrapper: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fafafa',
  },
  statusSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  mockLogoThumb: {
      width: '100%',
      height: '100%',
      backgroundColor: '#f9f9f9', // Beyaz mock logo
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
  },
  failedIcon: {
      fontSize: 24,
      color: '#EF4444', // Kırmızı ünlem
  },

  // Form Stilleri
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
  
  // Stil Çipleri
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

  // Create Düğmesi
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