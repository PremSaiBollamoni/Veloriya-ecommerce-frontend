// In React, environment variables must be prefixed with REACT_APP_
// Access them through window._env_ or import.meta.env for Vite, or process.env for Create React App
declare global {
  interface Window {
    _env_: {
      REACT_APP_API_URL?: string;
    };
  }
}

export const API_URL = 'https://veloriya-ecommerce-backend-server.onrender.com/api'; 