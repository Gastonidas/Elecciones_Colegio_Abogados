
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onClear: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onClear }) => {
  const menuItems: { id: AppView; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Panel General' },
    { id: 'padron', icon: 'fa-users', label: 'Padrón' },
    { id: 'votos-verdes', icon: 'fa-leaf', label: 'Votos Verdes' },
    { id: 'votar', icon: 'fa-check-to-slot', label: 'Cargar Votos' },
    { id: 'reportes', icon: 'fa-file-invoice', label: 'Reportes' },
  ];

  return (
    <aside className="w-64 bg-white h-screen border-r border-slate-200 flex flex-col sticky top-0">
      <div className="p-6 text-center border-b border-slate-100">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="fas fa-landmark text-emerald-700 text-3xl"></i>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Elecciones 2024</span>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
              currentView === item.id 
                ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-600 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <i className={`fas ${item.icon} w-6`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onClear}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <i className="fas fa-trash-alt"></i>
          <span>Limpiar Datos</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
