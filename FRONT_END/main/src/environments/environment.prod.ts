export const environment = {
  production: true,
  apiUrl: 'https://api.hps.com/api',
  authUrl: 'https://api.hps.com/api/auth',
  gatewayUrl: 'https://api.hps.com',
  appName: 'HPS User Management',
  version: '1.0.0',
  defaultPageSize: 25,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ['.csv', '.xlsx', '.xls'],
  sessionTimeout: 60 * 60 * 1000, // 1 hour
  refreshTokenInterval: 10 * 60 * 1000, // 10 minutes
  enableDebug: false,
  logLevel: 'error'
}; 