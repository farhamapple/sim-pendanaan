
import React, { useState } from 'react';
import { ResearchProject, Receipt } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Search, FileText, Download, Eye, Layers, BarChart3, Wallet } from 'lucide-react';

interface AdminUtamaViewProps {
  projects: ResearchProject[];
  receipts: Receipt[];
  onAddProject: (p: Omit<ResearchProject, 'id' | 'createdAt'>) => void;
  activeTab: string;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

const AdminUtamaView: React.FC<AdminUtamaViewProps> = ({ projects, receipts, onAddProject, activeTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    organizationName: '',
    projectType: 'Riset Dasar',
    leaderName: '',
    totalFunding: 0,
    proposalNumber: '',
    contractNumber: '',
    skNumber: '',
    sp2dNumber: ''
  });

  const filteredProjects = projects.filter(p => 
    p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.leaderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRealization = (projectId: string) => {
    return receipts
      .filter(r => r.projectId === projectId && r.isVerified)
      .reduce((sum, r) => sum + r.amount, 0);
  };

  const getSummaryData = () => {
    const totalAllocated = projects.reduce((sum, p) => sum + p.totalFunding, 0);
    const totalSpent = receipts.filter(r => r.isVerified).reduce((sum, r) => sum + r.amount, 0);
    return {
      totalAllocated,
      totalSpent,
      remaining: totalAllocated - totalSpent,
      realizationPercent: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0
    };
  };

  // Mengambil seluruh data proyek untuk visualisasi vertikal, termasuk Sisa
  const chartData = projects.map(p => {
    const realized = getRealization(p.id);
    return {
      name: p.projectName.length > 30 ? p.projectName.substring(0, 30) + '...' : p.projectName,
      fullName: p.projectName,
      Pagu: p.totalFunding,
      Realisasi: realized,
      Sisa: p.totalFunding - realized
    };
  });

  if (activeTab === 'dashboard') {
    const summary = getSummaryData();
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Pagu Keseluruhan</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalAllocated)}</h3>
            <div className="mt-4 text-xs font-semibold text-blue-600 bg-blue-50 py-1 px-2 rounded-lg inline-block">
              {projects.length} Proyek Terdaftar
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Realisasi</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(summary.totalSpent)}</h3>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${summary.realizationPercent}%` }}></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Sisa Anggaran BRIN</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(summary.remaining)}</h3>
            <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-widest">Dana Siap Serap</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Rata-rata Serapan</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.realizationPercent.toFixed(1)}%</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">Progress Nasional</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                <BarChart3 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xl">Visualisasi Realisasi Seluruh Proyek</h4>
                <p className="text-sm text-slate-500 font-medium">Monitoring perbandingan Pagu vs Realisasi untuk {projects.length} Proyek Riset</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                 <span className="text-xs font-bold text-slate-600">Pagu</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                 <span className="text-xs font-bold text-slate-600">Realisasi</span>
               </div>
            </div>
          </div>
          
          <div className="p-4 bg-white overflow-y-auto max-h-[700px]">
            <div style={{ height: `${projects.length * 45}px`, minHeight: '600px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  layout="vertical" 
                  margin={{ top: 20, right: 60, left: 40, bottom: 20 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    tickFormatter={(val) => `Rp ${val/1e6}jt`} 
                    stroke="#64748b" 
                    fontSize={11}
                    orientation="top"
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={220} 
                    stroke="#64748b" 
                    fontSize={10}
                    tick={{ fontWeight: 600 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 max-w-sm animate-in fade-in zoom-in duration-200">
                            <p className="text-xs font-black text-slate-800 leading-tight mb-3 border-b border-slate-50 pb-2">{data.fullName}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center gap-8">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Pagu Anggaran</span>
                                <span className="text-sm font-bold text-blue-600">{formatCurrency(data.Pagu)}</span>
                              </div>
                              <div className="flex justify-between items-center gap-8">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Realisasi (SPJ)</span>
                                <span className="text-sm font-bold text-emerald-600">{formatCurrency(data.Realisasi)}</span>
                              </div>
                              <div className="flex justify-between items-center gap-8 pt-1 border-t border-dashed border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Sisa Anggaran</span>
                                <span className="text-sm font-black text-amber-600">{formatCurrency(data.Sisa)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="Pagu" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />
                  <Bar dataKey="Realisasi" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
               Gulir (scroll) ke bawah untuk melihat data proyek lainnya
             </p>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'registration') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Registrasi Judul Penelitian</h3>
            <p className="text-slate-500 text-sm">Formulir pendaftaran proyek riset baru ke sistem</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            {showAddForm ? 'Batal' : <><Plus size={20} /> Tambah Registrasi</>}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <form className="space-y-8" onSubmit={(e) => {
              e.preventDefault();
              onAddProject(formData);
              setShowAddForm(false);
              setFormData({
                projectName: '', organizationName: '', projectType: 'Riset Dasar',
                leaderName: '', totalFunding: 0, proposalNumber: '', contractNumber: '',
                skNumber: '', sp2dNumber: ''
              });
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-slate-700">Nama Proyek Riset</label>
                  <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Organisasi Riset</label>
                  <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" value={formData.organizationName} onChange={e => setFormData({...formData, organizationName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Jenis Proyek Riset</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" value={formData.projectType} onChange={e => setFormData({...formData, projectType: e.target.value})}>
                    <option>Riset Dasar</option>
                    <option>Riset Terapan</option>
                    <option>Pengembangan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nama Ketua Proyek</label>
                  <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" value={formData.leaderName} onChange={e => setFormData({...formData, leaderName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Total Pendanaan (IDR)</label>
                  <input type="number" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" value={formData.totalFunding} onChange={e => setFormData({...formData, totalFunding: parseInt(e.target.value)})} />
                </div>

                <div className="col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">No. Proposal</label>
                    <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900" value={formData.proposalNumber} onChange={e => setFormData({...formData, proposalNumber: e.target.value})} />
                    <div className="text-[10px] text-blue-500 font-semibold cursor-pointer flex items-center gap-1"><Plus size={10}/> Upload File</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">No. Kontrak</label>
                    <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900" value={formData.contractNumber} onChange={e => setFormData({...formData, contractNumber: e.target.value})} />
                    <div className="text-[10px] text-blue-500 font-semibold cursor-pointer flex items-center gap-1"><Plus size={10}/> Upload File</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">No. SK Proyek</label>
                    <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900" value={formData.skNumber} onChange={e => setFormData({...formData, skNumber: e.target.value})} />
                    <div className="text-[10px] text-blue-500 font-semibold cursor-pointer flex items-center gap-1"><Plus size={10}/> Upload File</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">No. SP2D</label>
                    <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900" value={formData.sp2dNumber} onChange={e => setFormData({...formData, sp2dNumber: e.target.value})} />
                    <div className="text-[10px] text-blue-500 font-semibold cursor-pointer flex items-center gap-1"><Plus size={10}/> Upload File</div>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                Simpan Registrasi Proyek
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-slate-700">Daftar Proyek Terdaftar</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                placeholder="Cari Proyek..." 
                className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-64 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Judul & Organisasi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Ketua</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pagu</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{p.projectName}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">{p.organizationName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{p.leaderName}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">{formatCurrency(p.totalFunding)}</td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === 'monitoring') {
    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Wadah Utama Monitoring Realisasi</h3>
            <p className="text-slate-500 text-sm">Akses terpadu seluruh dokumen dan status anggaran 53 proyek</p>
          </div>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
            <Download size={18} /> Export Laporan Keseluruhan
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredProjects.map(p => {
            const realization = getRealization(p.id);
            const remaining = p.totalFunding - realization;
            const percent = (realization / p.totalFunding) * 100;
            return (
              <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all group">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">ID: {p.id}</span>
                       <h5 className="font-bold text-slate-800 leading-tight">{p.projectName}</h5>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Proposal</p>
                        <p className="text-xs font-semibold text-slate-700 truncate">{p.proposalNumber}</p>
                        <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold mt-1 cursor-pointer"><FileText size={10}/> Lihat</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Kontrak</p>
                        <p className="text-xs font-semibold text-slate-700 truncate">{p.contractNumber}</p>
                        <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold mt-1 cursor-pointer"><FileText size={10}/> Lihat</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">SK Riset</p>
                        <p className="text-xs font-semibold text-slate-700 truncate">{p.skNumber}</p>
                        <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold mt-1 cursor-pointer"><FileText size={10}/> Lihat</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">SP2D</p>
                        <p className="text-xs font-semibold text-slate-700 truncate">{p.sp2dNumber}</p>
                        <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold mt-1 cursor-pointer"><FileText size={10}/> Lihat</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-96 flex flex-col justify-center border-l-0 md:border-l border-slate-100 pl-0 md:pl-8">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Realisasi</p>
                      <p className="text-xl font-black text-slate-900">{percent.toFixed(1)}%</p>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-3">
                      <div className={`h-full transition-all duration-1000 ${percent > 90 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Terpakai</span>
                            </div>
                            <p className="text-xs font-bold text-emerald-600">{formatCurrency(realization)}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <div className="flex items-center gap-1 justify-end">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Sisa Dana</span>
                            </div>
                            <p className="text-xs font-black text-amber-600">{formatCurrency(remaining)}</p>
                        </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Total Pagu Proyek</span>
                        <span className="text-[10px] font-bold text-slate-600">{formatCurrency(p.totalFunding)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

export default AdminUtamaView;
