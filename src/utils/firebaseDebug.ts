/**
 * Firebase Configuration Debugger
 * Helps identify configuration issues with Firebase and Google Auth
 */

export function debugFirebaseConfig() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  console.group('🔥 Firebase Configuration Debug');
  console.log('API Key:', config.apiKey ? '✅ Set' : '❌ Missing');
  console.log('Auth Domain:', config.authDomain ? `✅ ${config.authDomain}` : '❌ Missing');
  console.log('Project ID:', config.projectId ? `✅ ${config.projectId}` : '❌ Missing');
  console.log('Storage Bucket:', config.storageBucket ? '✅ Set' : '❌ Missing');
  console.log('Messaging Sender ID:', config.messagingSenderId ? '✅ Set' : '❌ Missing');
  console.log('App ID:', config.appId ? '✅ Set' : '❌ Missing');
  console.groupEnd();

  // Check if running on localhost
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('localhost');

  console.group('🌐 Domain Information');
  console.log('Current Domain:', window.location.hostname);
  console.log('Is Localhost:', isLocalhost ? '✅ Yes' : '❌ No');
  console.log('Current URL:', window.location.href);
  console.groupEnd();

  // Check if Google Auth Provider is configured
  console.group('🔐 Google Auth Configuration');
  console.log('Expected Auth Domain:', config.authDomain);
  console.log('Expected Redirect:', `https://${config.authDomain}/__/auth/handler`);
  console.groupEnd();

  // Configuration checklist
  console.group('📋 Setup Checklist');
  console.log('1. Google Sign-In enabled in Firebase Console?');
  console.log('   → https://console.firebase.google.com/project/' + config.projectId + '/authentication/providers');
  console.log('2. Current domain authorized in Firebase?');
  console.log('   → Check Authentication > Settings > Authorized domains');
  console.log('3. OAuth consent screen configured?');
  console.log('   → https://console.cloud.google.com/apis/credentials/consent');
  console.log('4. OAuth redirect URIs configured?');
  console.log('   → https://console.cloud.google.com/apis/credentials');
  console.groupEnd();

  return {
    isValid: !!(config.apiKey && config.authDomain && config.projectId),
    config,
    isLocalhost
  };
}

export function logAuthError(error: any) {
  console.group('❌ Authentication Error Details');
  console.error('Error Code:', error.code || 'unknown');
  console.error('Error Message:', error.message || 'unknown');
  console.error('Full Error:', error);
  console.groupEnd();

  // Specific guidance based on error
  if (error.code === 'auth/unauthorized-domain') {
    console.warn('🔧 FIX: Add your current domain to authorized domains in Firebase Console');
    console.warn('   → Firebase Console > Authentication > Settings > Authorized domains');
    console.warn('   → Add:', window.location.hostname);
  }

  if (error.code === 'auth/operation-not-allowed') {
    console.warn('🔧 FIX: Enable Google Sign-In provider in Firebase Console');
    console.warn('   → Firebase Console > Authentication > Sign-in method');
    console.warn('   → Enable "Google" provider');
  }

  if (error.message && error.message.includes('invalid')) {
    console.warn('🔧 POSSIBLE FIX: Check OAuth configuration in Google Cloud Console');
    console.warn('   → Ensure redirect URIs are properly configured');
    console.warn('   → Ensure OAuth consent screen is set up');
  }
}
