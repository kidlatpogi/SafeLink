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
    width: 80,
    height: 80,
    tintColor: '#2b524a',
    marginBottom: 20,
  },

  forgot: {
    fontSize: 34,
    color: '#2b524a',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  password: {
    fontWeight: '400',
  },

  instructions: {
    color: '#2b524a',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '60%',
  },

  // Form Inputs
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bed2d0',
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
    color: '#bed2d0',
  },

  // Floating white panel at bottom
  whitePanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 350,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
    marginTop: 12,
    fontSize: 16,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#2b524a',
  },

  Btn: {
    backgroundColor: '#bed2d0',
    borderRadius: 24,
    paddingVertical: 14,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },

  BtnText: {
    color: '#2b524a',
    fontSize: 18,
    fontWeight: 'bold',
  },
});