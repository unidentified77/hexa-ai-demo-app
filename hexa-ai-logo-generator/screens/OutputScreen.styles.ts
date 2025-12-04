import { StyleSheet } from 'react-native';

export const PADDING_HORIZONTAL = 24;

export const COLORS = {
        DARK_1000: '#09090B', // InputScreen'den alınmıştır.
        DARK_900: '#1C1C1E',
        DARK_500: '#71717A',
        WHITE: '#FAFAFA',
        PRIMARY_PURPLE: '#943dff',
        BORDER: '#A1A1AA',
    };

export const styles = StyleSheet.create({
    fullScreenContainer: { flex: 1, backgroundColor: COLORS.DARK_1000 },
    backgroundImage: { flex: 1, width: '100%', height: '100%' },
    safeArea: { flex: 1 },
    headerBar: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        marginTop:12,
        fontFamily:'Manrope-Extrabold',
        fontSize: 22,
        fontWeight: '800',
        color: '#fafafa',
        lineHeight:28
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
        width: 342,
        height: 342,
        borderRadius: 16,
        backgroundColor: '#E1E1E1', 
    },
    promptCard: {
        width: '100%', 
        alignSelf: 'stretch',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#27272A', 
        marginBottom: 20,
    },
    promptHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    promptHeaderTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fafafa',
        height: 20
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    copyIcon: {
        fontFamily: 'Manrope-Regular',
        fontSize: 11,
        color: '#A1A1AA',
        fontWeight: '400',
    },
    promptText: {
        width: '100%',
        flexShrink: 1,
        fontSize: 16,
        color: '#fafafa',
        marginBottom: 12,
        fontWeight: '400',
        fontFamily: 'Manrope-Regular',
        lineHeight: 21,
    },
    styleChip: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        borderRadius: 50,
        backgroundColor: 'rgba(250, 250, 250, 0.10)',
        alignSelf: 'flex-start',
    },
    styleChipText: {
        fontSize: 12,
        color: '#fafafa',
        fontWeight: '400',
        fontFamily: 'Manrope-Regular',
        height: 16
    },
    jobInfo: {
        fontSize: 10,
        color: '#71717a',
        marginTop: 20,
    }
});