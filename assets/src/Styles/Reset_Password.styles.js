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

  logo: {
    width: 80,
    height: 80,
    tintColor: '#2b524a',
    marginBottom: 20,
  },
  
  title: {
    fontSize: 34,
    color: '#2b524a',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontWeight: '400',
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

  backToLogin: {
    color: '#bed2d0',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});