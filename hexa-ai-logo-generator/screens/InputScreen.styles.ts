import { StyleSheet } from 'react-native';

export const STATUS_HEIGHT = 70;
export const PADDING_HORIZONTAL = 24;
export const FOOTER_VERTICAL_PADDING = 15;
export const BUTTON_HEIGHT = 56;

export const COLORS = {
    DARK_1000: '#09090B',
    DARK_900: '#1C1C1E',
    DARK_500: '#71717A',
    DARK_300: '#D4D4D8',
    PRIMARY_PURPLE: '#943DFF',
    WHITE: '#FAFAFA',
    ERROR_RED: '#EF4444',
};

export const styles = StyleSheet.create({
    // --- STANDART LAYOUT ---
    mainContainer: { flex: 1, backgroundColor: COLORS.DARK_1000 },
    backgroundImage: { flex: 1, width: '100%', height: '100%' },
    safeArea: { flex: 1 },
    headerBox: { height: 60, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', paddingHorizontal: PADDING_HORIZONTAL },
    headerTitle: { fontFamily: 'Manrope-ExtraBold', fontSize: 17, fontWeight: '800', color: COLORS.WHITE },
    historyButton: { position: 'absolute', right: PADDING_HORIZONTAL, top: 15, padding: 5 },
    historyIcon: { fontSize: 24 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: PADDING_HORIZONTAL, paddingBottom: 30 + BUTTON_HEIGHT + FOOTER_VERTICAL_PADDING },
    scrollContentShifted: { paddingTop: STATUS_HEIGHT + 24 + 10 },

    // --- STATUS DISPLAY ---
    fixedStatusContainer: { position: 'absolute', top: 112, zIndex: 100, width: '100%', paddingHorizontal: PADDING_HORIZONTAL },
    statusContainer: { width: '100%', height: 70, flexDirection: 'row', alignItems: 'center', padding: 0, gap: 0 },

    // --- SOL KUTULAR ---
    leftBoxProcessing: { width: 70, height: 70, justifyContent: 'center', alignItems: 'center', backgroundColor: '#18181B', borderTopLeftRadius: 16, borderBottomLeftRadius: 16, borderTopRightRadius: 0, borderBottomRightRadius: 0 },

    // Done (Resim İçeren) Sol Kutu
    leftBoxDone: {
        width: 70, height: 70, justifyContent: 'center', alignItems: 'center',
        borderTopLeftRadius: 16, borderBottomLeftRadius: 16, borderTopRightRadius: 0, borderBottomRightRadius: 0,
        overflow: 'hidden'
    },

    // Failed Sol Kutu 
    leftBoxFailed: {
        width: 70, height: 70,
        borderTopLeftRadius: 16, borderBottomLeftRadius: 16, borderTopRightRadius: 0, borderBottomRightRadius: 0,
        overflow: 'hidden', backgroundColor: COLORS.ERROR_RED
    },

    // --- SAĞ KUTULAR ---
    rightBoxProcessingGradient: { flex: 1, height: 70, justifyContent: 'center', paddingHorizontal: 12, gap: 4, backgroundColor: '#27272A', borderTopRightRadius: 16, borderBottomRightRadius: 16, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },

    rightBoxDoneGradient: { flex: 1, height: 70, paddingHorizontal: 12, gap: 4, justifyContent: 'center',borderTopRightRadius: 16, borderBottomRightRadius: 16, borderTopLeftRadius: 0, borderBottomLeftRadius: 0,},
    
    rightBoxSolid: { flex: 1, height: 70, justifyContent: 'center', alignItems: 'flex-start', paddingHorizontal: 12, gap: 4, borderTopRightRadius: 16, borderBottomRightRadius: 16, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },

    // Failed Sağ Kutu
    rightBoxFailed: {
        flex: 1, height: 70, paddingHorizontal: 12, gap: 4,
        justifyContent: 'center', alignItems: 'flex-start',
        borderTopRightRadius: 16, borderBottomRightRadius: 16, borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
        backgroundColor: COLORS.ERROR_RED
    },

    // Failed Sağ Kutu
    rightBoxDone: {

    },

    // --- FAILED OVERLAY & ICON ---
    failedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(239, 68, 68, 0.70)', zIndex: 1 },
    failedIconContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 2 },

    // --- METİNLER ---
    statusTitle: { fontSize: 14, fontWeight: '700', color: COLORS.WHITE, fontFamily: 'Manrope-ExtraBold' },
    statusSubtitleProcessing: { color: COLORS.DARK_500, fontFamily: 'Manrope-Regular', fontSize: 13, fontWeight: '500', lineHeight: 18, letterSpacing: -0.13 },
    statusSubtitleResult: { color: COLORS.DARK_300, fontFamily: 'Manrope-Regular', fontSize: 13, fontWeight: '500', lineHeight: 18, letterSpacing: -0.13 },

    thumbnailBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: COLORS.WHITE, justifyContent: 'center', alignItems: 'center' },
    thumbnailText: { fontSize: 10, color: COLORS.DARK_900 },
    failedIcon: { fontSize: 24, color: COLORS.WHITE },

    // --- FORM & CHIPS ---
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 20 },
    sectionTitle: { color: COLORS.WHITE, textAlign: 'left', fontFamily: 'Manrope-ExtraBold', fontSize: 20, fontWeight: '800', lineHeight: 25 },
    surpriseChipContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    surpriseIcon: { color: COLORS.WHITE, fontFamily: 'Manrope-Regular', fontSize: 13,fontWeight: '400', lineHeight: 18, marginRight: 8, height:18 },
    surpriseText: {color: COLORS.WHITE, fontFamily: 'Manrope-Regular', fontSize: 13,fontWeight: '400', lineHeight: 18, height:18 },    
    textAreaContainer: { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, height: 150, marginBottom: 30 },
    textInput: { flex: 1, textAlignVertical: 'top', color: COLORS.WHITE, fontFamily: 'Manrope-Regular', fontSize: 16, fontWeight: '400', lineHeight: 21 },
    charCount: { fontSize: 12, color: COLORS.DARK_500, textAlign: 'right', marginTop: 5 },
    styleGrid: { paddingVertical: 10, gap: 8, marginBottom: 30, paddingHorizontal: PADDING_HORIZONTAL },
    chipWrapper: { alignItems: 'center', marginRight: 0 },
    chipVisualContainer: { width: 90, height: 90, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
    selectedBorder: { borderColor: COLORS.PRIMARY_PURPLE, borderWidth: 3 },
    unselectedNoStyleBorder: { borderColor: COLORS.WHITE, borderWidth: 2 },
    noStyleBoxBase: { width: '100%', height: '100%', borderRadius: 16, backgroundColor: '#27272A', overflow: 'hidden' },
    noStyleGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    noStyleInnerIcon: { justifyContent: 'center', alignItems: 'center' },
    imageWrapper: { width: '100%', height: '100%', borderRadius: 14, overflow: 'hidden', borderWidth: 0 },
    styleImageBox: { width: '100%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
    styleImageRadius: { borderRadius: 14 },
    chipTextSelected: { color: COLORS.WHITE, textAlign: 'center', fontFamily: 'Manrope-Regular', fontSize: 13, fontWeight: '700', lineHeight: 18, letterSpacing: -0.13 },
    chipTextUnselected: { color: COLORS.DARK_500, textAlign: 'center', fontFamily: 'Manrope-Regular', fontSize: 13, fontWeight: '400', lineHeight: 18 },

    // --- FOOTER ---
    footerGradientMask: { position: 'absolute', left: 0, right: 0, top: -50, height: 100, zIndex: 1 },
    footerContainer: { paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: FOOTER_VERTICAL_PADDING, backgroundColor: 'transparent' },
    createButtonWrapper: { borderRadius: 50, overflow: 'hidden' },
    createButton: { height: BUTTON_HEIGHT, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, gap: 8 },
    createButtonText: { color: COLORS.WHITE, textAlign: 'center', fontFamily: 'Manrope-ExtraBold', fontSize: 17, fontWeight: '800', lineHeight: 22, letterSpacing: -0.17 },
    createButtonDisabled: { opacity: 1 },

    // YENİ: Resim stili
    generatedLogoImage: { width: '100%', height: '100%' },
});