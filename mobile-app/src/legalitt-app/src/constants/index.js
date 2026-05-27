export * from './theme';

// ─── API ──────────────────────────────────────────────────────────────────────
export const API_TIMEOUT = 15000; // 15s

// ─── Indian States ────────────────────────────────────────────────────────────
export const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
];

// ─── Specializations ─────────────────────────────────────────────────────────
export const SPECIALIZATIONS = [
  { id: 'criminal', label: 'Criminal Law', icon: '⚖️' },
  { id: 'civil', label: 'Civil Law', icon: '📋' },
  { id: 'family', label: 'Family Law', icon: '👨‍👩‍👧' },
  { id: 'property', label: 'Property Law', icon: '🏠' },
  { id: 'corporate', label: 'Corporate Law', icon: '🏢' },
  { id: 'labour', label: 'Labour Law', icon: '👷' },
  { id: 'tax', label: 'Tax Law', icon: '💰' },
  { id: 'consumer', label: 'Consumer Law', icon: '🛒' },
  { id: 'cyber', label: 'Cyber Law', icon: '💻' },
  { id: 'constitutional', label: 'Constitutional Law', icon: '📜' },
  { id: 'ip', label: 'Intellectual Property', icon: '🧠' },
  { id: 'banking', label: 'Banking Law', icon: '🏦' },
  { id: 'environmental', label: 'Environmental Law', icon: '🌿' },
  { id: 'human_rights', label: 'Human Rights', icon: '✊' },
];

// ─── Languages ────────────────────────────────────────────────────────────────
export const LANGUAGES = [
  'Hindi', 'English', 'Marathi', 'Gujarati', 'Bengali',
  'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Punjabi',
  'Odia', 'Urdu', 'Assamese',
];

// ─── Booking Types ────────────────────────────────────────────────────────────
export const BOOKING_TYPES = [
  { id: 'in_person', label: 'In-person', icon: 'person-outline' },
  { id: 'video', label: 'Video Call', icon: 'videocam-outline' },
  { id: 'phone', label: 'Phone Call', icon: 'call-outline' },
];

// ─── Consultation Time Slots ──────────────────────────────────────────────────
export const TIME_SLOTS = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM',
  '04:00 PM','04:30 PM','05:00 PM','05:30 PM','06:00 PM',
];

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGE_SIZE = 10;

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const CHAT_SESSION_HOURS = 1;   // 1 hour per consultation
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_FILE_TYPES = ['application/pdf','image/jpeg','image/png','image/webp'];

// ─── Razorpay ─────────────────────────────────────────────────────────────────
export const RAZORPAY_CURRENCY = 'INR';
export const PLATFORM_FEE_PERCENT = 0; // Phase 1: no platform fee

// ─── Default location (Jabalpur, MP) ─────────────────────────────────────────
export const DEFAULT_LOCATION = {
  latitude: 23.1815,
  longitude: 79.9864,
  city: 'Jabalpur',
  state: 'Madhya Pradesh',
};

// ─── App Info ────────────────────────────────────────────────────────────────
export const APP_NAME = 'Legalitt';
export const APP_VERSION = '1.0.0';
export const SUPPORT_EMAIL = 'support@legalitt.com';
export const PRIVACY_URL = 'https://legalitt.com/privacy';
export const TERMS_URL = 'https://legalitt.com/terms';
