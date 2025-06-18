export const environment = {
  production: false,
  apiUrl: 'http://localhost:8088/api',
  authUrl: 'http://localhost:8088/api/auth',
  gatewayUrl: 'http://localhost:8088',
  appName: 'HPS User Management (Test)',
  version: '1.0.0',
  defaultPageSize: 5,
  maxFileSize: 1 * 1024 * 1024, // 1MB
  supportedFileTypes: ['.csv', '.xlsx', '.xls'],
  sessionTimeout: 5 * 60 * 1000, // 5 minutes
  refreshTokenInterval: 1 * 60 * 1000, // 1 minute
  enableDebug: true,
  logLevel: 'debug'
}; 