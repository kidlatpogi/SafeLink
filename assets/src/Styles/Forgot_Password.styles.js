import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  // Logo Section
  logoWrap: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  logo: {
    width: 120,
    height: 120,
    tintColor: '#fff',
    marginBottom: 20,
  },

  forgot: {
    fontSize: 34,
    color: '#1A1A1A',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  password: {
    fontWeight: '400',
    color: '#E82222',
  },

  instructions: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
    fontWeight: '500',
  },

  // Form Inputs
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2b524a',
    borderRadius: 24,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#2b524a',
  },

  // Floating white panel at bottom
  whitePanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200, // reduced height
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    color: '#2b524a',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },

  Btn: {
    backgroundColor: '#eb4b3f',
    borderRadius: 24,
    paddingVertical: 14,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },

  BtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  backText: {
    color: '#2b524a',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});