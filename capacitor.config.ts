import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tanglish.ide',
  appName: 'Tanglish++ IDE',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  backgroundColor: '#07090E',
};

export default config;
