export const ENV = {
  API_BASE: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
  COMMIT: import.meta.env.VITE_BUILD_COMMIT || ''
};
