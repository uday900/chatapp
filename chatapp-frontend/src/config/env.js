export const ENV = {
  API_BASE: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
  COMMIT: import.meta.env.VITE_BUILD_COMMIT || ''
};
