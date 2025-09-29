import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  // Logo Section
  logoWrap: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logoCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 120,
    height: 120,
  },

  title: {
    marginTop: 12,
    fontSize: 32,
    color: '#1A1A1A',
    fontWeight: '700',
    fontFamily: 'CanvaSans-Regular',
  },

  linkText: {
    color: '#E82222',
  },

  // Form Inputs
  form: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 50,
    width: '100%',
    backgroundColor: 'transparent',
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 16,
  },

  // Floating white panel at bottom
  whitePanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  forgotText: {
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 16,
  },

  Btn: {
    backgroundColor: '#eb4b3f',
    borderRadius: 24,
    paddingVertical: 14,
    marginBottom: 12,
    marginTop: -10,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    alignSelf: 'center',
  },

  BtnText: {
    fontFamily: 'Montserrat-Regular',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  orText: {
    color: '#eb4b3f',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Google Button
  GoogleBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#dadce0",
    paddingVertical: 14,
    marginBottom: 12,
    width: "100%",
    maxWidth: 420,
    alignSelf: 'center',
  },

  GoogleBtnText: {
    fontSize: 16,
    fontWeight: "bold", 
    color: "#3c4043",
    marginLeft: 12,
  },
});