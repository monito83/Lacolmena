// Tipos principales para La Colmena - Sistema de Gestión

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export const UserRole = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  ACCOUNTANT: 'accountant',
  SECRETARY: 'secretary'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  dni: string;
  address: string;
  phone: string;
  email?: string;
  enrollmentDate: Date;
  status: ChildStatus;
  familyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ChildStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred'
} as const;

export type ChildStatus = typeof ChildStatus[keyof typeof ChildStatus];

export interface Family {
  id: string;
  parent1Name: string;
  parent1Dni: string;
  parent1Phone: string;
  parent1Email?: string;
  parent2Name?: string;
  parent2Dni?: string;
  parent2Phone?: string;
  parent2Email?: string;
  address: string;
  children: Child[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  hireDate: Date;
  status: TeacherStatus;
  salary?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const TeacherStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave'
} as const;

export type TeacherStatus = typeof TeacherStatus[keyof typeof TeacherStatus];

// Sistema Fraterno de Aportes
export interface FraternalCommitment {
  id: string;
  family_id: string;
  student_id: string;
  academic_year: string;
  agreed_amount: number;
  suggested_amount?: number;
  payment_frequency: 'mensual' | 'trimestral' | 'anual';
  status: 'activo' | 'suspendido' | 'modificado' | 'finalizado';
  commitment_date: string;
  review_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  families?: {
    family_name: string;
    contact_email?: string;
    contact_phone?: string;
  };
  students?: {
    first_name: string;
    last_name: string;
    grade?: string;
  };
}

export interface Payment {
  id: string;
  family_id: string;
  student_id: string;
  commitment_id?: string;
  amount: number;
  payment_date: string;
  payment_method?: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
  reference_number?: string;
  month_paid?: string; // Formato: "2024-03"
  notes?: string;
  recorded_by?: string;
  created_at: string;
  families?: {
    family_name: string;
    contact_email?: string;
  };
  students?: {
    first_name: string;
    last_name: string;
    grade?: string;
  };
  fraternal_commitments?: {
    academic_year: string;
  };
}

export interface MonthlyPaymentStatus {
  id: string;
  family_id: string;
  student_id: string;
  commitment_id: string;
  year: number;
  month: number;
  expected_amount: number;
  paid_amount: number;
  status: 'pendiente' | 'parcial' | 'completo' | 'excedido';
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  families?: {
    family_name: string;
    contact_email?: string;
  };
  students?: {
    first_name: string;
    last_name: string;
    grade?: string;
  };
  fraternal_commitments?: {
    academic_year: string;
    agreed_amount: number;
  };
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  vendor?: string;
  receipt?: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ExpenseCategory = {
  SALARIES: 'salaries',
  UTILITIES: 'utilities',
  SUPPLIES: 'supplies',
  MAINTENANCE: 'maintenance',
  EQUIPMENT: 'equipment',
  OTHER: 'other'
} as const;

export type ExpenseCategory = typeof ExpenseCategory[keyof typeof ExpenseCategory];

// Dashboard y Reportes
export interface DashboardMetrics {
  totalChildren: number;
  activeChildren: number;
  totalFamilies: number;
  totalTeachers: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  outstandingPayments: number;
  fraternalBalance: number; // Equilibrio del sistema fraterno
}

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  data: any;
  generatedAt: Date;
  generatedBy: string;
}

export const ReportType = {
  FINANCIAL_SUMMARY: 'financial_summary',
  FAMILY_CONTRIBUTIONS: 'family_contributions',
  EXPENSE_BREAKDOWN: 'expense_breakdown',
  ENROLLMENT_STATUS: 'enrollment_status'
} as const;

export type ReportType = typeof ReportType[keyof typeof ReportType];

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


