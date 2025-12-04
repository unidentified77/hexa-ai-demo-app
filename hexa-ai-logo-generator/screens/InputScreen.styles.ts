import { StyleSheet } from 'react-native';

export const STATUS_HEIGHT = 70;
export const PADDING_HORIZONTAL = 24;
export const FOOTER_VERTICAL_PADDING = 15;
export const BUTTON_HEIGHT = 56;

export const COLORS = {
    DARK_1000: '#09090B',
    DARK_900: '#1C1C1E',
    DARK_500: '#71717A',
    PRIMARY_PURPLE: '#943DFF',
    WHITE: '#FAFAFA',
    ERROR_RED: '#EF4444',
};

export const styles = StyleSheet.create({
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
