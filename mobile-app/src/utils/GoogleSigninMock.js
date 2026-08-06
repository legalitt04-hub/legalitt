// src/utils/GoogleSigninMock.js
export const GoogleSignin = {
  configure: (config) => {
    console.log('[Mock GoogleSignin] Configured with:', config);
  },
  hasPlayServices: () => {
    console.log('[Mock GoogleSignin] hasPlayServices called');
    return Promise.resolve(true);
  },
  signIn: () => {
    console.log('[Mock GoogleSignin] signIn called');
    return Promise.resolve({
      user: {
        id: 'mock_google_id_99',
        name: 'Mock Google User',
        email: 'mock-user@legalitt.com',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      },
      idToken: 'mock_google_id_token_123',
    });
  },
  signOut: () => {
    console.log('[Mock GoogleSignin] signOut called');
    return Promise.resolve();
  },
  signInSilently: () => {
    console.log('[Mock GoogleSignin] signInSilently called');
    return Promise.resolve({
      user: {
        id: 'mock_google_id_99',
        name: 'Mock Google User',
        email: 'mock-user@legalitt.com',
      },
      idToken: 'mock_google_id_token_123',
    });
  },
  getCurrentUser: () => {
    console.log('[Mock GoogleSignin] getCurrentUser called');
    return Promise.resolve(null);
  },
};

export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
};
