window.MAPEAR_CONFIG = {
  apiBaseUrl: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://mapear-api.example.com',
  googleClientId: 'REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID'
};

