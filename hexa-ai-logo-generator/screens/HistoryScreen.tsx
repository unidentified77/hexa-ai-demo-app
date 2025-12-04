import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,  
  ActivityIndicator,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { styles } from './HistoryScreen.styles';
// Firebase Imports
import { getAuth } from 'firebase/auth';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot, 
    getFirestore 
} from 'firebase/firestore'; 
import { app, db, auth, appId } from '../utils/firebase';

const bgImage = require('../assets/images/back_gradient.png');

// Tipler
type RootStackParamList = {
  Input: undefined;
  Output: { jobId: string };
  History: undefined;
};

interface JobData {
    id: string;
    prompt: string;
    style: string;
    logoUrl: string;
    status: 'processing' | 'done' | 'failed';
    createdAt: any;
}

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [historyData, setHistoryData] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const userId = user.uid;
    const jobsRef = collection(db, `artifacts/${appId}/users/${userId}/jobs`);
    
    const q = query(jobsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobs: JobData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        jobs.push({
          id: doc.id,
          prompt: data.prompt || 'No Prompt',
          style: data.style || 'No Style',
          logoUrl: data.logoUrl || '',
          status: data.status,
          createdAt: data.createdAt
        });
      });
      setHistoryData(jobs);
      setLoading(false);
    }, (error) => {
      console.error("History fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleJobPress = (jobId: string) => {
    navigation.navigate('Output', { jobId });
  };

  const renderItem = ({ item }: { item: JobData }) => {
    const isDone = item.status === 'done';
    const isFailed = item.status === 'failed';
    
    let statusColor = '#71717a'; // Processing (Gri)
    if (isDone) statusColor = '#943dff'; // Done (Mor)
    if (isFailed) statusColor = '#EF4444'; // Failed (Kırmızı)

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleJobPress(item.id)}
        activeOpacity={0.7}
      >
        {/* Sol Taraf: Logo veya Durum İkonu */}
        <View style={styles.imageContainer}>
            {isDone && item.logoUrl ? (
                <Image source={{ uri: item.logoUrl }} style={styles.thumbnail} />
            ) : (
                <View style={[styles.statusPlaceholder, { borderColor: statusColor }]}>
                    <Text style={{fontSize: 20}}>{isFailed ? '!' : '...'}</Text>
                </View>
            )}
        </View>

        {/* Sağ Taraf: Bilgiler */}
        <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.styleTag}>{item.style}</Text>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            </View>
            <Text style={styles.promptText} numberOfLines={2}>{item.prompt}</Text>
            <Text style={styles.dateText}>
                {item.status === 'processing' ? 'Processing...' : item.status.toUpperCase()}
            </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground // <-- LinearGradient yerine ImageBackground kullanıldı
      source={bgImage} 
      resizeMode="cover"
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>History</Text>
            <View style={{width: 30}} /> 
        </View>

        {loading ? (
            <ActivityIndicator size="large" color="#943dff" style={{marginTop: 50}} />
        ) : (
            <FlatList
                data={historyData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No history yet. Create your first logo!</Text>
                }
            />
        )}
      </SafeAreaView>
    </ImageBackground>  
  );
};

export default HistoryScreen;