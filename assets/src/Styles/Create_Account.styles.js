import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  // BG
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header (Yung may Gradient)
  header: {
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  position: 'relative',
  },

  // Yung tatlong DOT sa header, Di ko alam para saan yon brah
  topDots: {
    position: 'absolute',
    left: 20,
    top: 18,
  },

  // First line ng header (Let's) magkaiba ng size sa Canva e
  headerText1: {
    color: '#fff',
    fontSize: 34.3,
    fontFamily: 'Montserrat-Regular',
  },

  // Yung second line ng header (Create Your Account) magkaiba din ng size
  headerText2: {
    color: '#fff',
    fontSize: 38.3,
    fontWeight: 'bold',
    maxWidth: '50%',
  fontFamily: 'Montserrat-Regular',
    lineHeight: 40,
    marginTop: 5,
  },

  // Close Button, Di ko alam bakit may X button, babalik ba sa Get Started to?
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },

  // Form Container
  form: {
  paddingHorizontal: 24,
  paddingTop: 24,
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0a3c3d', 
    borderRadius: 24,
    marginBottom: 16,
    paddingHorizontal: 12,
  height: 50,
  width: '100%',
  },

  // Email Input Wrapper
  emailInputWrapper: {
    marginTop: -150,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0a3c3d',
  },

  // Checkbox Row
  checkboxRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
  width: '100%',
  alignSelf: 'flex-start',
  paddingLeft: 0,
  },

  // Check Box
  checkbox: {
    marginRight: 8,
    ...Platform.select({
      ios: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
      android: {},
    }),
  },
  termsText: {
    fontSize: 13,
    color: '#222',
  },
  termsLink: {
    color: '#0a3c3d',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  // Create Account Button
  createAccountBtn: {
  backgroundColor: '#eb1c1c',
  borderRadius: 24,
  paddingVertical: 14,
  marginBottom: 12,
  width: '100%',
  maxWidth: 420,
  alignItems: 'center',
  alignSelf: 'center',
  },

  // Create Account Button Text
  createAccountBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Sign In Text
  signinText: {
  textAlign: 'left',
  fontSize: 13,
  color: '#222',
  alignSelf: 'flex-start',
  width: '100%',
  paddingLeft: 12,
  },

  // Link ng Sign In
  signinLink: {
    color: '#eb4b3f',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  // Or Text (centered)
  orText: {
    color: '#2b524a',
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 16,
  },
});
