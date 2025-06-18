export const environment = {
  production: false,
  apiUrl: 'http://localhost:8088/api',
  authUrl: 'http://localhost:8088/api/auth',
  gatewayUrl: 'http://localhost:8088',
  appName: 'HPS User Management',
  version: '1.0.0',
  defaultPageSize: 10,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedFileTypes: ['.csv', '.xlsx', '.xls'],
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  refreshTokenInterval: 5 * 60 * 1000, // 5 minutes
  enableDebug: true,
  logLevel: 'debug'
}; 