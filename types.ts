
export enum UserRole {
  ADMIN_UTAMA = 'ADMIN_UTAMA',
  ADMIN_KEUANGAN = 'ADMIN_KEUANGAN',
  VERIFIKATOR = 'VERIFIKATOR'
}

export interface BudgetItem {
  id: string;
  projectId: string;
  category: string;
  allocatedAmount: number;
}

export interface ResearchProject {
  id: string;
  projectName: string;
  organizationName: string;
  projectType: string;
  leaderName: string;
  totalFunding: number;
  proposalNumber: string;
  proposalFile?: string;
  contractNumber: string;
  contractFile?: string;
  skNumber: string;
  skFile?: string;
  sp2dNumber: string;
  sp2dFile?: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  projectId: string;
  budgetItemId: string; // Link ke kategori RAB
  amount: number;
  description: string;
  spjLink?: string;
  date: string;
  isVerified: boolean;
  createdBy: string;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  assignedProjectId?: string;
  password?: string;
}
