import { API_CONFIG } from '../constants/api';

// Image URL formatting
export const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Prepend CDN URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.IMAGE_BASE_URL}${cleanPath}`;
};

// Currency formatting
export const formatCurrency = (amount: number | string, currency = '৳'): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `${currency}0`;
  return `${currency}${numAmount.toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// Date formatting
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Time ago formatting
export const timeAgo = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};

// Phone number formatting
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  // Format for Bangladesh numbers
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Truncate text
export const truncate = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Status color mapping
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: '#F59E0B', // Amber
    accepted: '#10B981', // Green
    rejected: '#EF4444', // Red
    assigned: '#2563EB', // Blue
    completed: '#10B981', // Green
    cancelled: '#6B7280', // Gray
    available: '#10B981', // Green
    unavailable: '#EF4444', // Red
    verified: '#10B981', // Green
    'pending verification': '#F59E0B', // Amber
    'profile incomplete': '#EF4444', // Red
    'profile complete': '#2563EB', // Blue
  };

  return statusColors[status.toLowerCase()] || '#64748B';
};
