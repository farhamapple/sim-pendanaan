
import { ResearchProject, User, UserRole, BudgetItem } from './types';

export const INITIAL_PROJECTS: ResearchProject[] = Array.from({ length: 53 }, (_, i) => ({
  id: `proj-${i + 1}`,
  projectName: `Penelitian Unggulan BRIN ${i + 1}: Pengembangan Teknologi Masa Depan`,
  organizationName: i % 2 === 0 ? 'Pusat Riset Teknologi Informasi' : 'Pusat Riset Elektronika',
  projectType: 'Riset Dasar',
  leaderName: `Dr. Risetwan ${i + 1}, M.Si`,
  totalFunding: 100000000 + (i * 10000000),
  proposalNumber: `PROP/BRIN/2024/${(i + 1).toString().padStart(3, '0')}`,
  contractNumber: `KONTRAK/BRIN/2024/${(i + 1).toString().padStart(3, '0')}`,
  skNumber: `SK/BRIN/2024/${(i + 1).toString().padStart(3, '0')}`,
  sp2dNumber: `SP2D/KEMENKEU/2024/${(i + 1).toString().padStart(3, '0')}`,
  createdAt: new Date().toISOString()
}));

export const INITIAL_BUDGETS: BudgetItem[] = INITIAL_PROJECTS.flatMap(p => [
  { id: `b-${p.id}-1`, projectId: p.id, category: 'Honorarium Tim', allocatedAmount: p.totalFunding * 0.4 },
  { id: `b-${p.id}-2`, projectId: p.id, category: 'Bahan Habis Pakai (ATK)', allocatedAmount: p.totalFunding * 0.2 },
  { id: `b-${p.id}-3`, projectId: p.id, category: 'Perjalanan Dinas', allocatedAmount: p.totalFunding * 0.2 },
  { id: `b-${p.id}-4`, projectId: p.id, category: 'Sewa Peralatan', allocatedAmount: p.totalFunding * 0.1 },
  { id: `b-${p.id}-5`, projectId: p.id, category: 'Biaya Publikasi', allocatedAmount: p.totalFunding * 0.1 },
]);

export const INITIAL_USERS: User[] = [
  { id: 'u-0', username: 'admin', role: UserRole.ADMIN_UTAMA, password: 'password' },
  ...INITIAL_PROJECTS.map((p, i) => ({
    id: `u-keu-${i + 1}`,
    username: `user_${i + 1}`,
    role: UserRole.ADMIN_KEUANGAN,
    assignedProjectId: p.id,
    password: `pass_${i + 1}`
  })),
  ...INITIAL_PROJECTS.map((p, i) => ({
    id: `u-verif-${i + 1}`,
    username: `verif_${i + 1}`,
    role: UserRole.VERIFIKATOR,
    assignedProjectId: p.id,
    password: `vpass_${i + 1}`
  }))
];
