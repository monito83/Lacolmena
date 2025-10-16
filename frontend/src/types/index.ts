// Tipos principales para La Colmena - Sistema de Gestión

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  ACCOUNTANT = 'accountant',
  SECRETARY = 'secretary'
}

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

export enum ChildStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
  TRANSFERRED = 'transferred'
}

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

export enum TeacherStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave'
}

// Sistema Fraterno de Aportes
export interface FraternalCommitment {
  id: string;
  familyId: string;
  enrollmentAmount: number;
  monthlyContribution: number;
  commitmentDate: Date;
  reviewDate: Date;
  status: CommitmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum CommitmentStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  UNDER_REVIEW = 'under_review',
  INCREASED = 'increased'
}

export interface Payment {
  id: string;
  familyId: string;
  amount: number;
  type: PaymentType;
  date: Date;
  description: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentType {
  ENROLLMENT = 'enrollment',
  MONTHLY_CONTRIBUTION = 'monthly_contribution',
  EXTRA_CONTRIBUTION = 'extra_contribution'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
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

export enum ExpenseCategory {
  SALARIES = 'salaries',
  UTILITIES = 'utilities',
  SUPPLIES = 'supplies',
  MAINTENANCE = 'maintenance',
  EQUIPMENT = 'equipment',
  OTHER = 'other'
}

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

export enum ReportType {
  FINANCIAL_SUMMARY = 'financial_summary',
  FAMILY_CONTRIBUTIONS = 'family_contributions',
  EXPENSE_BREAKDOWN = 'expense_breakdown',
  ENROLLMENT_STATUS = 'enrollment_status'
}

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


