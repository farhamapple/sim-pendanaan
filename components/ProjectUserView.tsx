
import React, { useState } from 'react';
import { User, ResearchProject, Receipt, UserRole, BudgetItem } from '../types';
import { Wallet, Plus, Trash2, CheckCircle, XCircle, Clock, FileText, Link as LinkIcon, ExternalLink, AlertTriangle, ListChecks, Edit2, Save, X, Info, TrendingUp } from 'lucide-react';

interface ProjectUserViewProps {
  user: User;
  projects: ResearchProject[];
  budgetItems: BudgetItem[];
  receipts: Receipt[];
  onAddReceipt: (r: Omit<Receipt, 'id' | 'isVerified'>) => void;
  onUpdateReceipt: (id: string, updates: Partial<Receipt>) => void;
  onDeleteReceipt: (id: string) => void;
  onVerifyReceipt: (id: string, status: boolean) => void;
  onAddBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  onUpdateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  onDeleteBudgetItem: (id: string) => void;
  activeTab: string;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

const ProjectUserView: React.FC<ProjectUserViewProps> = ({ 
  user, projects, budgetItems, receipts, onAddReceipt, onUpdateReceipt, onDeleteReceipt, onVerifyReceipt, 
  onAddBudgetItem, onUpdateBudgetItem, onDeleteBudgetItem, activeTab 
}) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [spjLink, setSpjLink] = useState<string>('');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local state for RAB editing
  const [showAddBudgetForm, setShowAddBudgetForm] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState<string>('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editBudgetCategory, setEditBudgetCategory] = useState('');
  const [editBudgetAmount, setEditBudgetAmount] = useState<string>('');

  // Local state for Receipt editing
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);
  const [editReceiptAmount, setEditReceiptAmount] = useState<string>('');
  const [editReceiptDescription, setEditReceiptDescription] = useState<string>('');
  const [editReceiptSpjLink, setEditReceiptSpjLink] = useState<string>('');
  const [editReceiptBudgetId, setEditReceiptBudgetId] = useState<string>('');

  const project = projects.find(p => p.id === user.assignedProjectId);
  if (!project) return <div>Project Not Found</div>;

  const projectBudgets = budgetItems.filter(b => b.projectId === project.id);
  const projectReceipts = receipts.filter(r => r.projectId === project.id);
  
  const getBudgetStats = (budgetId: string, excludeReceiptId?: string) => {
    const budgetItem = projectBudgets.find(b => b.id === budgetId);
    if (!budgetItem) return { allocated: 0, spent: 0, remaining: 0, percent: 0 };
    
    const spent = projectReceipts
      .filter(r => r.budgetItemId === budgetId && r.id !== excludeReceiptId)
      .reduce((sum, r) => sum + r.amount, 0);
      
    const remaining = budgetItem.allocatedAmount - spent;
    const percent = (spent / budgetItem.allocatedAmount) * 100;

    return {
      allocated: budgetItem.allocatedAmount,
      spent: spent,
      remaining: remaining,
      percent: percent
    };
  };

  const realization = projectReceipts.filter(r => r.isVerified).reduce((sum, r) => sum + r.amount, 0);
  const remaining = project.totalFunding - realization;

  const totalAllocatedInRab = projectBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const rabLimitRemaining = project.totalFunding - totalAllocatedInRab;

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseInt(newBudgetAmount);
    if (amountVal > rabLimitRemaining) {
      alert(`Alokasi melebihi sisa pagu proyek. Sisa: ${formatCurrency(rabLimitRemaining)}`);
      return;
    }
    onAddBudgetItem({
      projectId: project.id,
      category: newBudgetCategory,
      allocatedAmount: amountVal
    });
    setNewBudgetCategory('');
    setNewBudgetAmount('');
    setShowAddBudgetForm(false);
  };

  const handleStartEditBudget = (b: BudgetItem) => {
    setEditingBudgetId(b.id);
    setEditBudgetCategory(b.category);
    setEditBudgetAmount(b.allocatedAmount.toString());
  };

  const handleSaveEditBudget = (id: string) => {
    const newAmount = parseInt(editBudgetAmount);
    const oldItem = projectBudgets.find(b => b.id === id);
    if (!oldItem) return;

    const diff = newAmount - oldItem.allocatedAmount;
    if (diff > rabLimitRemaining) {
      alert(`Alokasi melebihi sisa pagu proyek. Sisa: ${formatCurrency(rabLimitRemaining)}`);
      return;
    }

    onUpdateBudgetItem(id, {
      category: editBudgetCategory,
      allocatedAmount: newAmount
    });
    setEditingBudgetId(null);
  };

  // Receipt Handlers
  const handleStartEditReceipt = (r: Receipt) => {
    setEditingReceiptId(r.id);
    setEditReceiptAmount(r.amount.toString());
    setEditReceiptDescription(r.description);
    setEditReceiptSpjLink(r.spjLink || '');
    setEditReceiptBudgetId(r.budgetItemId);
  };

  const handleSaveEditReceipt = (id: string) => {
    const newAmount = parseInt(editReceiptAmount);
    const stats = getBudgetStats(editReceiptBudgetId, id);

    if (newAmount > stats.remaining) {
      alert(`Saldo RAB tidak mencukupi. Sisa saldo untuk kategori ini: ${formatCurrency(stats.remaining)}`);
      return;
    }

    onUpdateReceipt(id, {
      amount: newAmount,
      description: editReceiptDescription,
      spjLink: editReceiptSpjLink,
      budgetItemId: editReceiptBudgetId
    });
    setEditingReceiptId(null);
  };

  // Render RAB View
  if (activeTab === 'rab-view') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                <ListChecks size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Rencana Anggaran Biaya (RAB)</h3>
                <p className="text-slate-500 text-xs font-medium">Kelola alokasi pengeluaran per kategori anggaran</p>
              </div>
            </div>
            {user.role === UserRole.ADMIN_KEUANGAN && (
              <button 
                onClick={() => setShowAddBudgetForm(!showAddBudgetForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                {showAddBudgetForm ? <X size={18} /> : <Plus size={18} />}
                {showAddBudgetForm ? 'Batal' : 'Tambah Kategori'}
              </button>
            )}
          </div>

          {showAddBudgetForm && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 animate-in slide-in-from-top-4 duration-300">
              <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Plus size={16} /> Tambah Item RAB Baru
              </h4>
              <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nama Kategori</label>
                  <input 
                    required 
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900" 
                    placeholder="Contoh: Honorarium Tim"
                    value={newBudgetCategory}
                    onChange={e => setNewBudgetCategory(e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Alokasi Dana (Rp)</label>
                  <input 
                    type="number" required 
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900" 
                    placeholder="Contoh: 10000000"
                    value={newBudgetAmount}
                    onChange={e => setNewBudgetAmount(e.target.value)}
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                    Simpan Item RAB
                  </button>
                </div>
              </form>
              <p className="mt-2 text-[10px] text-amber-600 font-bold">
                * Sisa pagu proyek yang belum dialokasikan: {formatCurrency(rabLimitRemaining)}
              </p>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Kategori Anggaran</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Alokasi (Pagu)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Realisasi/Booking</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Sisa Saldo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase w-32">Progres</th>
                  {user.role === UserRole.ADMIN_KEUANGAN && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectBudgets.map(b => {
                  const stats = getBudgetStats(b.id);
                  const isEditing = editingBudgetId === b.id;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input 
                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-slate-900"
                            value={editBudgetCategory}
                            onChange={e => setEditBudgetCategory(e.target.value)}
                          />
                        ) : (
                          <p className="font-bold text-slate-800">{b.category}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">
                        {isEditing ? (
                          <input 
                            type="number"
                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-right text-slate-900"
                            value={editBudgetAmount}
                            onChange={e => setEditBudgetAmount(e.target.value)}
                          />
                        ) : (
                          formatCurrency(stats.allocated)
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-600">{formatCurrency(stats.spent)}</td>
                      <td className="px-6 py-4 text-right font-bold text-amber-600">{formatCurrency(stats.remaining)}</td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${stats.percent > 90 ? 'bg-red-500' : 'bg-blue-600'}`} 
                            style={{ width: `${Math.min(100, stats.percent)}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-right mt-1 font-bold text-slate-400">{stats.percent.toFixed(1)}%</p>
                      </td>
                      {user.role === UserRole.ADMIN_KEUANGAN && (
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button 
                                  onClick={() => handleSaveEditBudget(b.id)}
                                  className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                                  title="Simpan"
                                >
                                  <Save size={16} />
                                </button>
                                <button 
                                  onClick={() => setEditingBudgetId(null)}
                                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                  title="Batal"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleStartEditBudget(b)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Edit Kategori"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (stats.spent > 0) {
                                      alert('Tidak dapat menghapus kategori yang sudah memiliki transaksi.');
                                      return;
                                    }
                                    if (confirm(`Hapus kategori "${b.category}"?`)) {
                                      onDeleteBudgetItem(b.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Hapus Kategori"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold">
                  <td className="px-6 py-4 rounded-bl-2xl">TOTAL ALOKASI RAB</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(totalAllocatedInRab)}</td>
                  <td className="px-6 py-4 text-right text-emerald-400">{formatCurrency(projectReceipts.reduce((s, r) => s + r.amount, 0))}</td>
                  <td className="px-6 py-4 text-right text-amber-400">
                    {formatCurrency(totalAllocatedInRab - projectReceipts.reduce((s, r) => s + r.amount, 0))}
                  </td>
                  <td className="px-6 py-4"></td>
                  {user.role === UserRole.ADMIN_KEUANGAN && <td className="px-6 py-4 rounded-br-2xl"></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'project-view') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
            <div>
              <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">
                Profil Riset Anda
              </span>
              <h2 className="text-2xl font-bold text-slate-800 leading-tight">{project.projectName}</h2>
              <p className="text-slate-500 font-medium mt-1">{project.leaderName} | {project.organizationName}</p>
            </div>
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-center min-w-[240px]">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Pagu</p>
              <h3 className="text-2xl font-bold">{formatCurrency(project.totalFunding)}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center gap-5">
              <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200">
                <CheckCircle size={28} />
              </div>
              <div>
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Realisasi Terverifikasi</p>
                <h4 className="text-2xl font-black text-emerald-800">{formatCurrency(realization)}</h4>
              </div>
            </div>
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-center gap-5">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-emerald-200">
                <Wallet size={28} />
              </div>
              <div>
                <p className="text-amber-700 text-xs font-bold uppercase tracking-wider">Sisa Dana Tersedia</p>
                <h4 className="text-2xl font-black text-amber-800">{formatCurrency(remaining)}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'input-receipt' || activeTab === 'verification') {
    const selectedBudgetStats = selectedBudgetId ? getBudgetStats(selectedBudgetId) : null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
        <div className="lg:col-span-1 space-y-6">
          {user.role === UserRole.ADMIN_KEUANGAN && (
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Plus size={20} className="text-blue-500" /> Input Kwitansi Keluar
              </h4>
              <form className="space-y-5" onSubmit={(e) => {
                e.preventDefault();
                setErrorMsg(null);
                
                if (!selectedBudgetId) {
                  setErrorMsg('Silakan pilih kategori RAB terlebih dahulu.');
                  return;
                }

                const inputAmount = parseInt(amount);
                const budgetStats = getBudgetStats(selectedBudgetId);

                if (inputAmount > budgetStats.remaining) {
                  setErrorMsg(`Saldo RAB tidak mencukupi. Sisa saldo ${formatCurrency(budgetStats.remaining)}`);
                  return;
                }

                onAddReceipt({
                  projectId: project.id,
                  budgetItemId: selectedBudgetId,
                  amount: inputAmount,
                  description: description,
                  spjLink: spjLink,
                  date: new Date().toISOString(),
                  createdBy: user.id
                });
                
                setAmount('');
                setDescription('');
                setSpjLink('');
                setSelectedBudgetId('');
              }}>
                {errorMsg && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start gap-2 text-xs font-bold border border-red-100 animate-bounce">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori RAB</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-900"
                    value={selectedBudgetId}
                    onChange={e => {
                      setSelectedBudgetId(e.target.value);
                      setErrorMsg(null);
                    }}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {projectBudgets.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.category} (Sisa: {formatCurrency(getBudgetStats(b.id).remaining)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBudgetStats && (
                  <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-blue-800 uppercase flex items-center gap-1">
                        <Info size={12} /> Status Anggaran Item
                      </span>
                      <span className="text-[10px] font-bold text-blue-600">{selectedBudgetStats.percent.toFixed(1)}% Terpakai</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                       <div className="flex flex-col">
                         <span className="text-[9px] text-slate-400 font-bold uppercase">Pagu Item</span>
                         <span className="text-[11px] font-bold text-slate-700">{formatCurrency(selectedBudgetStats.allocated)}</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[9px] text-slate-400 font-bold uppercase">Terpakai</span>
                         <span className="text-[11px] font-bold text-emerald-600">{formatCurrency(selectedBudgetStats.spent)}</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[9px] text-slate-400 font-bold uppercase">Sisa Item</span>
                         <span className="text-[11px] font-black text-amber-600">{formatCurrency(selectedBudgetStats.remaining)}</span>
                       </div>
                    </div>

                    <div className="w-full bg-blue-200/50 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${selectedBudgetStats.percent > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, selectedBudgetStats.percent)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Uang (Rp)</label>
                  <input 
                    type="number" required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold text-slate-900" 
                    value={amount} onChange={e => {
                      setAmount(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Contoh: 500000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan / Uraian</label>
                  <textarea 
                    required rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900" 
                    value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Jelaskan penggunaan dana..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <LinkIcon size={12} /> Link SPJ anda
                  </label>
                  <input 
                    type="url" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900" 
                    value={spjLink} onChange={e => setSpjLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                  />
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2">
                  <Plus size={20}/> Simpan Kwitansi
                </button>
              </form>
            </div>
          )}
          
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
             <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 text-center">Ringkasan Anggaran Proyek</h4>
             <div className="space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-500 text-sm">Pagu Proyek</span>
                  <span className="font-bold">{formatCurrency(project.totalFunding)}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-500 text-sm">Realisasi (Terverifikasi)</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(realization)}</span>
               </div>
               <div className="flex justify-between items-center py-4">
                  <span className="text-slate-500 text-sm">Total Sisa Dana</span>
                  <span className="text-xl font-black text-amber-400">{formatCurrency(remaining)}</span>
               </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2">
           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-2">
                   <TrendingUp className="text-blue-500" size={20} />
                   <h4 className="font-bold text-slate-800">Riwayat Transaksi Kwitansi</h4>
                </div>
             </div>
             <div className="divide-y divide-slate-100">
               {projectReceipts.length === 0 ? (
                 <div className="p-12 text-center text-slate-400">
                    <Clock size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium italic">Belum ada transaksi kwitansi yang tercatat.</p>
                 </div>
               ) : (
                 projectReceipts.slice().reverse().map(r => {
                   const budget = projectBudgets.find(b => b.id === r.budgetItemId);
                   const isEditing = editingReceiptId === r.id;
                   const statsDuringEdit = isEditing ? getBudgetStats(editReceiptBudgetId, r.id) : null;

                   return (
                     <div key={r.id} className="p-6 transition-colors hover:bg-slate-50">
                        {isEditing ? (
                          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-blue-200 animate-in fade-in slide-in-from-top-2">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                   <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Kategori RAB</label>
                                   <select 
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-sm text-slate-900"
                                      value={editReceiptBudgetId}
                                      onChange={e => setEditReceiptBudgetId(e.target.value)}
                                   >
                                      {projectBudgets.map(b => (
                                         <option key={b.id} value={b.id}>{b.category}</option>
                                      ))}
                                   </select>
                                </div>
                                <div>
                                   <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Jumlah (Rp)</label>
                                   <input 
                                      type="number"
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-sm font-bold text-slate-900"
                                      value={editReceiptAmount}
                                      onChange={e => setEditReceiptAmount(e.target.value)}
                                   />
                                   {statsDuringEdit && (
                                     <p className="text-[9px] text-blue-600 mt-1 font-bold">
                                       Sisa Saldo Kategori: {formatCurrency(statsDuringEdit.remaining)}
                                     </p>
                                   )}
                                </div>
                                <div className="md:col-span-2">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Keterangan</label>
                                   <input 
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-sm text-slate-900"
                                      value={editReceiptDescription}
                                      onChange={e => setEditReceiptDescription(e.target.value)}
                                   />
                                </div>
                                <div className="md:col-span-2">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Link SPJ</label>
                                   <input 
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-sm text-slate-900"
                                      value={editReceiptSpjLink}
                                      onChange={e => setEditReceiptSpjLink(e.target.value)}
                                   />
                                </div>
                             </div>
                             <div className="flex justify-end gap-2 pt-2">
                                <button 
                                   onClick={() => setEditingReceiptId(null)}
                                   className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-200 rounded-lg transition-all"
                                >
                                   Batal
                                </button>
                                <button 
                                   onClick={() => handleSaveEditReceipt(r.id)}
                                   className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1"
                                >
                                   <Save size={14} /> Simpan Perubahan
                                </button>
                             </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5 flex-1 min-w-0">
                               <div className={`p-3 rounded-2xl flex-shrink-0 ${r.isVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                  {r.isVerified ? <CheckCircle size={24}/> : <Clock size={24}/>}
                               </div>
                               <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-bold text-slate-800 text-lg">{formatCurrency(r.amount)}</p>
                                    <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                                      {budget?.category || 'Umum'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-500 font-medium truncate">{r.description}</p>
                                  
                                  <div className="flex flex-wrap items-center gap-3 mt-1">
                                     <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                     <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${r.isVerified ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'} uppercase`}>
                                       {r.isVerified ? 'Terverifikasi' : 'Pending'}
                                     </span>
                                     {r.spjLink && (
                                       <a 
                                         href={r.spjLink} 
                                         target="_blank" 
                                         rel="noopener noreferrer"
                                         className="text-[10px] text-blue-600 font-bold flex items-center gap-1 hover:underline bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100"
                                       >
                                         <ExternalLink size={10} /> Link SPJ
                                       </a>
                                     )}
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                               {user.role === UserRole.ADMIN_KEUANGAN && !r.isVerified && (
                                 <>
                                   <button 
                                     onClick={() => handleStartEditReceipt(r)}
                                     className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                     title="Edit Kwitansi"
                                   >
                                     <Edit2 size={20} />
                                   </button>
                                   <button 
                                     onClick={() => onDeleteReceipt(r.id)}
                                     className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                     title="Hapus Kwitansi"
                                   >
                                     <Trash2 size={20} />
                                   </button>
                                 </>
                               )}
                               {user.role === UserRole.VERIFIKATOR && (
                                 <>
                                   {r.isVerified ? (
                                     <button 
                                       onClick={() => onVerifyReceipt(r.id, false)}
                                       className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100"
                                     >
                                       <XCircle size={18}/> Batal Setuju
                                     </button>
                                   ) : (
                                     <button 
                                       onClick={() => onVerifyReceipt(r.id, true)}
                                       className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                     >
                                       <CheckCircle size={18}/> Setujui Dana
                                     </button>
                                   )}
                                 </>
                               )}
                            </div>
                          </div>
                        )}
                     </div>
                   );
                 })
               )}
             </div>
           </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProjectUserView;
