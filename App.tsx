
import React, { useState, useEffect } from 'react';
import { User, ResearchProject, Receipt, UserRole, BudgetItem } from './types';
import { INITIAL_PROJECTS, INITIAL_USERS, INITIAL_BUDGETS } from './constants';
import Layout from './components/Layout';
import Login from './components/Login';
import AdminUtamaView from './components/AdminUtamaView';
import ProjectUserView from './components/ProjectUserView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ResearchProject[]>(INITIAL_PROJECTS);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(INITIAL_BUDGETS);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Load from local storage if available
  useEffect(() => {
    const savedProjects = localStorage.getItem('brin_projects');
    const savedReceipts = localStorage.getItem('brin_receipts');
    const savedBudgets = localStorage.getItem('brin_budgets');
    
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedReceipts) setReceipts(JSON.parse(savedReceipts));
    if (savedBudgets) setBudgetItems(JSON.parse(savedBudgets));
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('brin_projects', JSON.stringify(projects));
    localStorage.setItem('brin_receipts', JSON.stringify(receipts));
    localStorage.setItem('brin_budgets', JSON.stringify(budgetItems));
  }, [projects, receipts, budgetItems]);

  const handleLogin = (username: string, password: string) => {
    const foundUser = INITIAL_USERS.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      if (foundUser.role === UserRole.ADMIN_UTAMA) {
        setActiveTab('dashboard');
      } else {
        setActiveTab('project-view');
      }
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
  };

  const addProject = (p: Omit<ResearchProject, 'id' | 'createdAt'>) => {
    const newId = `proj-${projects.length + 1}`;
    const newProject: ResearchProject = {
      ...p,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    
    // Create default RAB for new project
    const defaultBudgets: BudgetItem[] = [
      { id: `b-${newId}-1`, projectId: newId, category: 'Honorarium Tim', allocatedAmount: p.totalFunding * 0.4 },
      { id: `b-${newId}-2`, projectId: newId, category: 'Bahan Habis Pakai (ATK)', allocatedAmount: p.totalFunding * 0.2 },
      { id: `b-${newId}-3`, projectId: newId, category: 'Perjalanan Dinas', allocatedAmount: p.totalFunding * 0.2 },
      { id: `b-${newId}-4`, projectId: newId, category: 'Sewa Peralatan', allocatedAmount: p.totalFunding * 0.1 },
      { id: `b-${newId}-5`, projectId: newId, category: 'Biaya Publikasi', allocatedAmount: p.totalFunding * 0.1 },
    ];

    setProjects([newProject, ...projects]);
    setBudgetItems([...defaultBudgets, ...budgetItems]);
  };

  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = {
      ...item,
      id: `b-${item.projectId}-${Date.now()}`
    };
    setBudgetItems([...budgetItems, newItem]);
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    setBudgetItems(budgetItems.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter(b => b.id !== id));
  };

  const addReceipt = (receipt: Omit<Receipt, 'id' | 'isVerified'>) => {
    const newReceipt: Receipt = {
      ...receipt,
      id: `rcpt-${Date.now()}`,
      isVerified: false,
    };
    setReceipts([...receipts, newReceipt]);
  };

  const updateReceipt = (id: string, updates: Partial<Receipt>) => {
    setReceipts(receipts.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteReceipt = (id: string) => {
    setReceipts(receipts.filter(r => r.id !== id));
  };

  const verifyReceipt = (id: string, status: boolean) => {
    setReceipts(receipts.map(r => r.id === id ? { ...r, isVerified: status } : r));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {user.role === UserRole.ADMIN_UTAMA ? (
        <AdminUtamaView 
          projects={projects} 
          receipts={receipts} 
          onAddProject={addProject} 
          activeTab={activeTab} 
        />
      ) : (
        <ProjectUserView 
          user={user} 
          projects={projects} 
          budgetItems={budgetItems}
          receipts={receipts} 
          onAddReceipt={addReceipt}
          onUpdateReceipt={updateReceipt}
          onDeleteReceipt={deleteReceipt}
          onVerifyReceipt={verifyReceipt}
          onAddBudgetItem={addBudgetItem}
          onUpdateBudgetItem={updateBudgetItem}
          onDeleteBudgetItem={deleteBudgetItem}
          activeTab={activeTab}
        />
      )}
    </Layout>
  );
};

export default App;
