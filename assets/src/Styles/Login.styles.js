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
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'CanvaSans-Regular',
  },

  linkText: {
    color: '#fff',
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
    color: '#bed2d0',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 16,
  },

  Btn: {
    backgroundColor: '#bed2d0',
    borderRadius: 24,
    paddingVertical: 14,
    marginBottom: 12,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    alignSelf: 'center',
  },

  BtnText: {
    fontFamily: 'Montserrat-Regular',
    color: '#2b524a',
    fontSize: 18,
    fontWeight: 'bold',
  },

  orText: {
    color: '#bed2d0',
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 16,
  },
});