import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.logyourbody.app',
  appName: 'LogYourBody',
  webDir: 'dist',
  server: {
    url: process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : undefined,
    cleartext: true
  },
  ios: {
    scheme: 'LogYourBody',
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#000000'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#0073ff'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    }
  }
};

export default config;
