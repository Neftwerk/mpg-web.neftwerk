// Neftwerk API Configuration

export const API_BASE_URL = "https://backendneftwerk-staging.up.railway.app";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
    LOGIN_OTP_REQUEST: `${API_BASE_URL}/api/auth/login/otp`,
    LOGIN_OTP_VERIFY: `${API_BASE_URL}/api/auth/login/otp/verify`,
    GOOGLE_OAUTH: `${API_BASE_URL}/api/auth/google`,
    GOOGLE_CALLBACK: `${API_BASE_URL}/api/auth/google/callback`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
  },
};
