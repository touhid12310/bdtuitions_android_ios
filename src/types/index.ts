// Teacher Type
export interface Teacher {
  id: number;
  teacher_code: string;
  teacher_name: string;
  phone_number: string;
  email: string;
  gender: 'Male' | 'Female';
  university_name: string;
  department_name: string;
  academic_year: string;
  medium: string;
  city: string;
  area: string;
  living_address: string;
  expected_class?: string;
  expected_subject?: string;
  expected_medium?: string;
  day_per_week?: string;
  expected_salary?: number;
  expected_area?: string[];
  personal_photo?: string;
  university_id_photo?: string;
  nid_front?: string;
  nid_back?: string;
  selfie?: string;
  whatsapp_number?: string;
  facebook_link?: string;
  father_brother_phone?: string;
  mother_sister_phone?: string;
  departmental_friend_phone?: string;
  school_name?: string;
  ssc_group?: string;
  college_name?: string;
  hsc_group?: string;
  status: string;
  unread_notifications_count: number;
}

// Tuition Type
export interface Tuition {
  id: number;
  tuition_code: string;
  city: string;
  area: string;
  class: string;
  group_of_study?: string;
  medium: string;
  prefered_subjects: string;
  prefered_university?: string;
  prefered_gender: string;
  day_per_week: string;
  salary: number;
  media_fee: number;
  prefered_time?: string;
  prefered_duration?: string;
  student_short_details?: string;
  tutor_requirement?: string;
  status: string;
  has_applied?: boolean;
  can_apply?: boolean;
  created_at?: string;
}

// Application Type
export interface Application {
  id: number;
  tuition_id: number;
  teacher_id: number;
  status: string;
  note?: string;
  date?: string;
  tuition?: Tuition;
  created_at?: string;
}

// Assignment Type
export interface Assignment {
  id: number;
  tuition_id: number;
  teacher_id: number;
  status: string;
  payment_status?: string;
  due_amount: number;
  effective_due: number;
  total_paid: number;
  next_payment?: string;
  booked_by?: string;
  assignment_by?: string;
  commission_status?: string;
  refund_status?: string;
  refund_date?: string;
  note?: string;
  date?: string;
  tuition?: Tuition;
}

// Report Type
export interface Report {
  id: number;
  assignment_id: number;
  teacher_id: number;
  report: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

// Transaction Type
export interface Transaction {
  id: number;
  teacher_id: number;
  assignment_id: number;
  amount: number;
  payment_type: string;
  payment_method?: string;
  transaction_id?: string;
  payment_by?: string;
  status?: string;
  date?: string;
  note?: string;
  assignment?: Assignment;
}

// Notification Type
export interface Notification {
  id: number;
  teacher_id: number;
  title: string;
  message: string;
  status: 'read' | 'unread';
  is_read: boolean;
  date?: string;
  created_at?: string;
}

// Dashboard Stats Type
export interface DashboardStats {
  total_applications: number;
  total_assignments: number;
  active_assignments: number;
  pending_payments: number;
  total_due: string;
  total_paid: string;
  unread_notifications: number;
  profile_status: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Auth Types
export interface LoginCredentials {
  login: string;
  password: string;
  device_name?: string;
}

export interface RegisterData {
  teacher_name: string;
  phone_number: string;
  whatsapp_number: string;
  email: string;
  facebook_link: string;
  father_brother_phone: string;
  departmental_friend_phone: string;
  password: string;
  password_confirmation: string;
  gender: 'Male' | 'Female';
  university_name: string;
  department_name: string;
  academic_year: string;
  medium: string;
  city: string;
  area: string;
  expected_area: string[];
  living_address: string;
  university_id_photo: any;
  nid_front: any;
  nid_back: any;
  personal_photo: any;
  selfie: any;
}

export interface AuthState {
  token: string | null;
  teacher: Teacher | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, teacher: Teacher) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateTeacher: (teacher: Partial<Teacher>) => void;
}

// Location Types
export interface City {
  id: string;
  name: string;
}

export interface Area {
  id: string;
  name: string;
}

// Pending Payment Type
export interface PendingPayment {
  id: number;
  tuition_id: number;
  tuition_code: string;
  tuition_class: string;
  tuition_area: string;
  due_amount: number;
  effective_due: number;
  total_paid: number;
  status: string;
}

// Refund Types
export interface RefundEligibleAssignment {
  id: number;
  tuition_id: number;
  tuition_code: string;
  tuition_class: string;
  tuition_area: string;
  paid_amount: number;
  can_request_refund: boolean;
}

export interface RefundRequest {
  id: number;
  assignment_id: number;
  tuition_code: string;
  amount: number;
  status: string;
  requested_date?: string;
}
