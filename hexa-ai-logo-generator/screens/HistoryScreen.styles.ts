import { StyleSheet } from 'react-native';

const PADDING_HORIZONTAL = 24;

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090B',},
    backgroundImage: { flex: 1, width: '100%', height: '100%' }, 
    safeArea: {flex: 1,},
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 10,
      paddingBottom: 20,
    },
    title: {
      fontFamily:'Manrope-Extrabold',
      fontSize: 20,
      fontWeight: '800',
      color: '#fafafa',
    },
    backButton: {
      padding: 5,
    },
    backIcon: {
      fontSize: 24,
      color: '#fafafa',
    },
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 30,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      alignItems: 'center',
    },
    imageContainer: {
      width: 60,
      height: 60,
      marginRight: 12,
    },
    thumbnail: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
      backgroundColor: '#fff',
    },
    statusPlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.05)',
    },
    infoContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    styleTag: {
      fontSize: 10,
      color: '#943dff',
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    promptText: {
      fontSize: 14,
      color: '#fafafa',
      fontWeight: '500',
      marginBottom: 4,
    },
    dateText: {
      fontSize: 10,
      color: '#71717a',
    },
    emptyText: {
        color: '#71717a',
        textAlign: 'center',
        marginTop: 50,
    }
  });
  