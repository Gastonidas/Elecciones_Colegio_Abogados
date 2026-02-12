
import React, { useMemo, useState } from 'react';
import { GreenVote, Lawyer } from '../types';

interface ReportsProps {
  votosVerdes: GreenVote[];
  votedSet: Set<string>;
}

const Reports: React.FC<ReportsProps> = ({ votosVerdes, votedSet }) => {
  const [filterReferente, setFilterReferente] = useState<string>('all');

  // Estadísticas globales de la elección
  const globalStats = useMemo(() => {
    const totalEmitidos = votedSet.size;
    const verdesEmitidos = votosVerdes.filter(v => votedSet.has(`${v.tomo}-${v.folio}`)).length;
    const porcentajeVerde = totalEmitidos > 0 ? (verdesEmitidos / totalEmitidos) * 100 : 0;

    return {
      totalEmitidos,
      verdesEmitidos,
      porcentajeVerde
    };
  }, [votosVerdes, votedSet]);

  // Estadísticas por referente
  const referentStats = useMemo(() => {
    const stats: Record<string, { total: number; voted: number; pending: Lawyer[] }> = {};
    
    votosVerdes.forEach(v => {
      v.referentes.forEach(ref => {
        if (!stats[ref]) {
          stats[ref] = { total: 0, voted: 0, pending: [] };
        }
        stats[ref].total += 1;
        const voted = votedSet.has(`${v.tomo}-${v.folio}`);
        if (voted) {
          stats[ref].voted += 1;
        } else {
          stats[ref].pending.push(v);
        }
      });
    });

    const entries = Object.entries(stats).sort((a, b) => b[1].total - a[1].total);
    
    if (filterReferente !== 'all') {
      return entries.filter(([name]) => name === filterReferente);
    }
    
    return entries;
  }, [votosVerdes, votedSet, filterReferente]);

  // Lista de todos los referentes para el filtro
  const allReferentes = useMemo(() => {
    const refs = new Set<string>();
    votosVerdes.forEach(v => v.referentes.forEach(r => refs.add(r)));
    return Array.from(refs).sort();
  }, [votosVerdes]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Encabezado y Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <h2 className="text-2xl font-bold text-slate-800">Reportes y Estadísticas</h2>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <label className="text-xs font-bold text-slate-400 uppercase">Filtrar:</label>
            <select 
              className="text-sm font-semibold outline-none bg-transparent min-w-[150px]"
              value={filterReferente}
              onChange={(e) => setFilterReferente(e.target.value)}
            >
              <option value="all">Todos los Referentes</option>
              {allReferentes.map(ref => (
                <option key={ref} value={ref}>{ref}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <i className="fas fa-print"></i>
            Imprimir Pantalla
          </button>
        </div>
      </div>

      {/* Interfaz de Votos Emitidos (Global) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Votos Emitidos (Total)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-800">{globalStats.totalEmitidos}</span>
            <span className="text-slate-400 font-medium">sobres</span>
          </div>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-100">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Votos de Lista Verde</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-700">{globalStats.verdesEmitidos}</span>
            <span className="text-emerald-600 font-medium">identificados</span>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">% de Presencia Verde</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{globalStats.porcentajeVerde.toFixed(1)}%</span>
            <span className="text-slate-400 font-medium text-xs">del total emitido</span>
          </div>
        </div>
      </div>

      {/* Detalle por Referente */}
      <div className="grid grid-cols-1 gap-8">
        {referentStats.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <i className="fas fa-folder-open text-slate-300 text-6xl mb-4"></i>
            <p className="text-slate-500 font-medium">No hay datos para mostrar. Cargue el archivo de Votos Verdes.</p>
          </div>
        ) : (
          referentStats.map(([name, stat], idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm break-inside-avoid">
              <div className="bg-emerald-700 p-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">{name}</h3>
                  <p className="text-emerald-100 text-sm font-medium">Seguimiento de Votantes</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black">{stat.total}</div>
                  <div className="text-[10px] font-bold uppercase opacity-75">Abogados Asignados</div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100">
                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Efectivizados</p>
                  <p className="text-2xl font-black text-emerald-700">{stat.voted}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl text-center border border-red-100">
                  <p className="text-[10px] font-bold text-red-500 uppercase mb-1">Pendientes de Voto</p>
                  <p className="text-2xl font-black text-red-600">{stat.pending.length}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Efectividad</p>
                  <p className="text-2xl font-black text-emerald-800">
                    {stat.total > 0 ? ((stat.voted / stat.total) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Faltan Votar ({stat.pending.length})</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="text-left pb-3 font-bold uppercase text-[10px]">Tomo-Folio</th>
                        <th className="text-left pb-3 font-bold uppercase text-[10px]">Apellido y Nombre</th>
                        <th className="text-right pb-3 font-bold uppercase text-[10px] no-print">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {stat.pending.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-emerald-600 font-bold italic">
                            <i className="fas fa-star mr-2"></i> ¡Excelente! Todos los abogados de este referente ya votaron.
                          </td>
                        </tr>
                      ) : (
                        stat.pending.map((v, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 font-mono font-bold text-slate-600">{v.tomo}-{v.folio}</td>
                            <td className="py-3 text-slate-800 font-bold uppercase">{v.apellido}, {v.nombre}</td>
                            <td className="py-3 text-right no-print">
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-black">PENDIENTE</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="print-only text-center mt-12 pt-8 border-t border-slate-200">
        <div className="font-bold text-slate-800 mb-1">Sistema de Control Electoral - Colegio de Abogados de Quilmes</div>
        <div className="text-xs text-slate-400">
          Generado el {new Date().toLocaleDateString()} a las {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
