
import React from 'react';

interface DashboardProps {
  padronCount: number;
  greenCount: number;
  votedCount: number;
  greenVotedCount: number;
  onUploadPadron: (file: File) => void;
  onUploadGreen: (file: File) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  padronCount, 
  greenCount, 
  votedCount, 
  greenVotedCount,
  onUploadPadron,
  onUploadGreen
}) => {
  const stats = [
    { label: 'Habilitados (Padrón)', value: padronCount, icon: 'fa-users', color: 'bg-blue-500' },
    { label: 'Proyectados (Verdes)', value: greenCount, icon: 'fa-leaf', color: 'bg-emerald-500' },
    { label: 'Votantes Totales', value: votedCount, icon: 'fa-check-circle', color: 'bg-slate-700' },
    { label: 'Verdes que Votaron', value: greenVotedCount, icon: 'fa-user-check', color: 'bg-emerald-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-5">
            <div className={`${stat.color} text-white p-4 rounded-lg shadow-inner`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fas fa-chart-line text-emerald-600"></i>
          Estado de la Elección
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-600 uppercase">Participación General</span>
              <span className="text-emerald-700">{padronCount > 0 ? ((votedCount / padronCount) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-1000" 
                style={{ width: `${padronCount > 0 ? (votedCount / padronCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-600 uppercase">Efectividad Voto Verde</span>
              <span className="text-emerald-700">{greenCount > 0 ? ((greenVotedCount / greenCount) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="w-full bg-emerald-100 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-emerald-700 h-full transition-all duration-1000" 
                style={{ width: `${greenCount > 0 ? (greenVotedCount / greenCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Uploads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-400 transition-colors flex flex-col items-center text-center space-y-4">
          <div className="text-emerald-600 text-4xl"><i className="fas fa-file-excel"></i></div>
          <div>
            <h3 className="font-bold text-slate-800">Cargar Padrón Electoral</h3>
            <p className="text-sm text-slate-500">Formato XLSX (.xlsx). Columnas: Tomo, Folio, Apellido, Nombre</p>
          </div>
          <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer transition-all shadow-md">
            Seleccionar Archivo
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx" 
              onChange={(e) => e.target.files?.[0] && onUploadPadron(e.target.files[0])} 
            />
          </label>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-400 transition-colors flex flex-col items-center text-center space-y-4">
          <div className="text-emerald-700 text-4xl"><i className="fas fa-leaf"></i></div>
          <div>
            <h3 className="font-bold text-slate-800">Cargar Votos Verdes</h3>
            <p className="text-sm text-slate-500">Columnas: Tomo, Folio, Apellido, Nombre, Referente</p>
          </div>
          <label className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer transition-all shadow-md">
            Seleccionar Archivo
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx" 
              onChange={(e) => e.target.files?.[0] && onUploadGreen(e.target.files[0])} 
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
