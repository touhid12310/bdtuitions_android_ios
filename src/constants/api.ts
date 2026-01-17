// API Configuration
export const API_CONFIG = {
  // Update this URL to your Laravel API base URL
  BASE_URL: __DEV__
    ? 'http://192.168.0.114/ruble-tution/panel/public/api/v1'  // For physical device (Laragon)
    : 'https://manage.bdtuition.com/api/v1',                    // Production URL

  // CDN URL for images (always use production)
  IMAGE_BASE_URL: 'https://manage.bdtuition.com',

  // For physical device testing, use your computer's local IP address
  // Make sure Laragon Apache is running

  TIMEOUT: 30000, // 30 seconds
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_OTP: '/auth/verify-otp',
  RESEND_OTP: '/auth/resend-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',

  // Profile
  PROFILE: '/profile',
  PROFILE_DOCUMENTS: '/profile/documents',
  PROFILE_VERIFICATION: '/profile/verification',

  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_RECENT_APPLICATIONS: '/dashboard/recent-applications',

  // Tuitions
  TUITIONS: '/tuitions',

  // Applications
  APPLICATIONS: '/applications',

  // Assignments
  ASSIGNMENTS: '/assignments',

  // Payments
  PAYMENTS_PENDING: '/payments/pending',
  PAYMENTS_HISTORY: '/payments/history',
  PAYMENTS_MANUAL: '/payments/manual',
  PAYMENTS_BKASH_CREATE: '/payments/bkash/create',
  PAYMENTS_BKASH_EXECUTE: '/payments/bkash/execute',

  // Verification
  VERIFICATION_PAY: '/verification/pay',
  VERIFICATION_EXECUTE: '/verification/execute',

  // Refunds
  REFUNDS: '/refunds',

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',

  // Locations
  LOCATIONS_CITIES: '/locations/cities',
  LOCATIONS_AREAS: '/locations/areas',
};
