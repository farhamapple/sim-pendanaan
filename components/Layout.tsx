
import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, Home, FileText, PieChart, CheckCircle, Database, ListChecks } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Database size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">SIM-PENDANAAN</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">BRIN Keuangan</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {user.role === UserRole.ADMIN_UTAMA && (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Home size={20} /> <span className="font-medium">Dashboard Utama</span>
              </button>
              <button
                onClick={() => setActiveTab('registration')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'registration' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <FileText size={20} /> <span className="font-medium">Registrasi Judul</span>
              </button>
              <button
                onClick={() => setActiveTab('monitoring')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'monitoring' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <PieChart size={20} /> <span className="font-medium">Monitoring Anggaran</span>
              </button>
            </>
          )}

          {(user.role === UserRole.ADMIN_KEUANGAN || user.role === UserRole.VERIFIKATOR) && (
            <>
              <button
                onClick={() => setActiveTab('project-view')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'project-view' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Home size={20} /> <span className="font-medium">Status Keuangan</span>
              </button>
              <button
                onClick={() => setActiveTab('rab-view')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'rab-view' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <ListChecks size={20} /> <span className="font-medium">Rencana Anggaran (RAB)</span>
              </button>
              {user.role === UserRole.ADMIN_KEUANGAN && (
                <button
                  onClick={() => setActiveTab('input-receipt')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'input-receipt' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  <FileText size={20} /> <span className="font-medium">Input Kwitansi</span>
                </button>
              )}
              {user.role === UserRole.VERIFIKATOR && (
                <button
                  onClick={() => setActiveTab('verification')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'verification' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  <CheckCircle size={20} /> <span className="font-medium">Verifikasi</span>
                </button>
              )}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-inner">
              {getInitials(user.username)}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold truncate text-sm">{user.username}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium"
          >
            <LogOut size={20} /> <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800">Sistem Informasi Manajemen Keuangan</h2>
            <p className="text-sm text-slate-500">Badan Riset dan Inovasi Nasional (BRIN)</p>
          </div>
          <div className="flex items-center gap-4">
             <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
               Versi 1.1.0-RAB
             </span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
