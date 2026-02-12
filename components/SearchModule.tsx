
import React, { useState } from 'react';
import { Lawyer, GreenVote } from '../types';

interface SearchModuleProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

const SearchModule: React.FC<SearchModuleProps> & { List: React.FC<ListProps> } = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600">
        <i className="fas fa-search"></i>
      </div>
      <input
        type="text"
        placeholder="Buscar por Tomo, Folio, Apellido o Referente..."
        className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

interface ListProps {
  title: string;
  data: (Lawyer | GreenVote)[];
  votedSet: Set<string>;
  searchTerm: string;
  onToggleVote: (tomo: string, folio: string) => void;
  isGreenList?: boolean;
}

const List: React.FC<ListProps> = ({ title, data, votedSet, searchTerm, onToggleVote, isGreenList }) => {
  const [selectedReferente, setSelectedReferente] = useState<string>('all');

  // Obtener lista de todos los referentes para el dropdown
  const allReferentes = React.useMemo(() => {
    if (!isGreenList) return [];
    const refs = new Set<string>();
    (data as GreenVote[]).forEach(v => v.referentes.forEach(r => refs.add(r)));
    return Array.from(refs).sort();
  }, [data, isGreenList]);

  const filteredData = React.useMemo(() => {
    const s = searchTerm.toLowerCase();
    return data.filter(item => {
      const matchSearch = item.tomo.toLowerCase().includes(s) || 
                          item.folio.toLowerCase().includes(s) || 
                          item.apellido.toLowerCase().includes(s) || 
                          item.nombre.toLowerCase().includes(s);
      
      let matchReferente = true;
      if (isGreenList) {
        const g = item as GreenVote;
        const matchesRefSearch = g.referentes.some(ref => ref.toLowerCase().includes(s));
        const matchesRefFilter = selectedReferente === 'all' || g.referentes.includes(selectedReferente);
        
        return (matchSearch || matchesRefSearch) && matchesRefFilter;
      }
      
      return matchSearch;
    });
  }, [data, searchTerm, isGreenList, selectedReferente]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500 font-medium">{filteredData.length} registros mostrados</p>
        </div>

        {isGreenList && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Filtrar por Referente:</label>
            <select 
              className="bg-white border border-slate-200 rounded-lg text-sm p-2 focus:ring-2 focus:ring-emerald-500 outline-none min-w-[150px]"
              value={selectedReferente}
              onChange={(e) => setSelectedReferente(e.target.value)}
            >
              <option value="all">Todos los Referentes</option>
              {allReferentes.map(ref => (
                <option key={ref} value={ref}>{ref}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Tomo-Folio</th>
              <th className="px-6 py-4">Abogado</th>
              {isGreenList && <th className="px-6 py-4">Referente(s)</th>}
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={isGreenList ? 5 : 4} className="px-6 py-12 text-center text-slate-400 italic">
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              filteredData.map((lawyer, idx) => {
                const key = `${lawyer.tomo}-${lawyer.folio}`;
                const hasVoted = votedSet.has(key);
                return (
                  <tr key={idx} className={`hover:bg-slate-50 transition-colors ${hasVoted ? 'bg-emerald-50/30' : ''}`}>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">
                      {lawyer.tomo}-{lawyer.folio}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 uppercase">{lawyer.apellido}, {lawyer.nombre}</div>
                    </td>
                    {isGreenList && (
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(lawyer as GreenVote).referentes.map((ref, rIdx) => (
                            <span key={rIdx} className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              {ref}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        hasVoted ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
                      }`}>
                        <i className={`fas ${hasVoted ? 'fa-check' : 'fa-times'}`}></i>
                        {hasVoted ? 'Votó' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onToggleVote(lawyer.tomo, lawyer.folio)}
                        className={`p-2 rounded-lg transition-all ${
                          hasVoted ? 'text-slate-400 hover:text-red-600' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={hasVoted ? "Modificar Voto (Quitar)" : "Cargar Voto"}
                      >
                        <i className={`fas ${hasVoted ? 'fa-undo' : 'fa-plus-circle'} text-lg`}></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

SearchModule.List = List;

export default SearchModule;
