import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, RouteProp, useRoute, NavigationProp } from '@react-navigation/native';

// TypeScript için navigasyon tipleri
type RootStackParamList = {
  Input: undefined;
  Output: { jobId: string }; // SADECE jobId parametresini bekliyor
};

type OutputScreenRouteProp = RouteProp<RootStackParamList, 'Output'>;

// --- MOCK VERİLER ---
// Bu veriler, Firebase'den gelmesi beklenen verileri simüle ediyor
const MOCK_FIREBASE_DATA = {
    // Gerçekte: job.data().logoUrl
    logoUrl: "https://placehold.co/400x400/FFFFFF/000000?text=HARRISON+%26+CO.", 
    // Gerçekte: job.data().prompt
    prompt: "A professional logo for Harrison & Co. Law Firm, using balanced serif fonts",
    // Gerçekte: job.data().style
    style: "Monogram",
};
const MOCK_LOGO_URL = MOCK_FIREBASE_DATA.logoUrl;
// --- MOCK VERİLER SONU ---


const OutputScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<OutputScreenRouteProp>();
  
  // Navigasyon parametresinden sadece jobId alınır
  const { jobId } = route.params;

  // Gerçekte, burada Firebase'den çekilecek verileri tutan state
  const [jobData, setJobData] = useState(MOCK_FIREBASE_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // BURASI ÇOK ÖNEMLİ:
    // Gerçekte: Firestore'daki jobs/{jobId} belgesini dinleyen onSnapshot kodu buraya gelecek.

    // Şimdilik Mock Veri Gecikmesi: Verinin Firebase'den geldiğini simüle edelim.
    setTimeout(() => {
        setIsLoading(false);
    }, 500); // 500ms bekleme
    
  }, [jobId]); // jobId değiştiğinde tekrar çalışır

  
  // URL kopyalama fonksiyonu (React Native'de Clipboard kullanılır)
  const handleCopyPrompt = () => {
    // Gerçek uygulamada Clipboard.setString(jobData.prompt); kullanılır
    console.log("Prompt kopyalandı:", jobData.prompt);
  };
  
  const handleClose = () => {
      // Çıktı ekranını kapatıp Input ekranına döner
      navigation.goBack();
  };

  return (
    // Degrade Arka Planı (InputScreen ile aynı)
    <LinearGradient
      colors={['#1a1936', '#0e0e1b']} 
      style={styles.fullScreenContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* 1. Başlık Çubuğu: "Your Design" ve Kapatma (X) simgesi */}
        <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>Your Design</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                {/* X Kapatma Simgesi */}
                <Text style={styles.closeIcon}>✕</Text> 
            </TouchableOpacity>
        </View>

        {/* Ana İçerik Kaydırılabilir Alan */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#943dff" />
                    <Text style={styles.loadingText}>Loading design data...</Text>
                </View>
            ) : (
                <>
                    {/* 2. Logo Görüntüleyici Alanı */}
                    <View style={styles.logoContainer}>
                        {/* Mock Logo Görseli (Beyaz arka plan) */}
                        <Image 
                            source={{ uri: MOCK_LOGO_URL }}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* 3. Prompt Bilgisi Kartı */}
                    <View style={styles.promptCard}>
                        
                        {/* Prompt Başlığı ve Kopyala Simgesi */}
                        <View style={styles.promptHeader}>
                            <Text style={styles.promptHeaderTitle}>Prompt</Text>
                            <TouchableOpacity onPress={handleCopyPrompt} style={styles.copyButton}>
                                {/* Kopyala Simgesi için Mock: ❐ */}
                                <Text style={styles.copyIcon}>❐ Copy</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Prompt Metni */}
                        <Text style={styles.promptText}>{jobData.prompt}</Text>

                        {/* Seçilen Stil Çipi */}
                        <View style={styles.styleChip}>
                            {/* Firebase'den gelen stil burada gösteriliyor */}
                            <Text style={styles.styleChipText}>{jobData.style}</Text> 
                        </View>
                    </View>
                </>
            )}
            
            {/* Job ID ve Debug Bilgisi (Opsiyonel) */}
            <Text style={styles.jobInfo}>Job ID: {jobId}</Text>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// --- STYLES ---

const styles = StyleSheet.create({
  // Genel Kapsayıcılar
  fullScreenContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  
  // 1. Başlık Çubuğu Stilleri
  headerBar: {
    paddingHorizontal: 24, 
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // InputScreen'deki başlıkla aynı font stilini kullanır
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
  
  // Ana İçerik Alanı
  scrollContent: {
    paddingHorizontal: 24, 
    paddingBottom: 30, 
    alignItems: 'center', // Öğeleri ortalamak için
    flexGrow: 1, // Loading ekranını ortalamak için
    justifyContent: 'flex-start',
  },
  
  // Loading Durumu
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 400, // Yeterli dikey boşluk sağlamak için
  },
  loadingText: {
      marginTop: 15,
      color: '#943dff',
      fontSize: 16,
      fontWeight: '600',
  },
  
  // 2. Logo Görüntüleyici Alanı
  logoContainer: {
    width: '100%',
    aspectRatio: 1, // Kare yapmak için
    backgroundColor: '#FFFFFF', // Beyaz arka plan
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
  
  // 3. Prompt Bilgisi Kartı
  promptCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Hafif şeffaf koyu arka plan
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
      color: '#943dff', // Mor renk
      fontWeight: '600',
  },
  promptText: {
    fontSize: 14,
    color: '#fafafa',
    marginBottom: 12,
  },
  styleChip: {
    alignSelf: 'flex-start', // Sadece içeriği kadar genişlemesi için
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
  
  // Debug/İş Bilgisi
  jobInfo: {
      fontSize: 10,
      color: '#71717a',
      marginTop: 20,
  }
});

export default OutputScreen;