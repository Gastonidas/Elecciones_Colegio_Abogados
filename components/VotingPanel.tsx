
import React, { useState, useEffect, useRef } from 'react';
import { Lawyer } from '../types';

interface VotingPanelProps {
  tomos: string[];
  padron: Lawyer[];
  votedSet: Set<string>;
  onVote: (tomo: string, folio: string) => void;
}

const VotingPanel: React.FC<VotingPanelProps> = ({ tomos, padron, votedSet, onVote }) => {
  const [selectedTomo, setSelectedTomo] = useState(tomos[0] || '');
  const [folioInput, setFolioInput] = useState('');
  const [lastAction, setLastAction] = useState<{tomo: string, folio: string, type: 'added' | 'already' | 'not_found'} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTomo || !folioInput) return;

    const key = `${selectedTomo}-${folioInput}`;
    
    // Verificar si el votante existe en el padrón
    const exists = padron.find(l => l.tomo === selectedTomo && l.folio === folioInput);
    
    if (!exists) {
      setLastAction({ tomo: selectedTomo, folio: folioInput, type: 'not_found' });
      setFolioInput('');
      inputRef.current?.focus();
      return; // Detener la ejecución, no se puede cargar si no está en padrón
    }

    if (votedSet.has(key)) {
      setLastAction({ tomo: selectedTomo, folio: folioInput, type: 'already' });
    } else {
      onVote(selectedTomo, folioInput);
      setLastAction({ tomo: selectedTomo, folio: folioInput, type: 'added' });
    }
    
    setFolioInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <i className="fas fa-fingerprint text-emerald-600"></i>
          Registro de Votantes
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 uppercase tracking-tight">Tomo</label>
              <select 
                value={selectedTomo}
                onChange={(e) => setSelectedTomo(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-lg"
              >
                <option value="">Seleccionar Tomo</option>
                {tomos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 uppercase tracking-tight">Folio</label>
              <input 
                ref={inputRef}
                type="text" 
                value={folioInput}
                onChange={(e) => setFolioInput(e.target.value)}
                placeholder="Ej: 124"
                className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-lg"
                autoFocus
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all text-xl"
          >
            CARGAR VOTO
          </button>
        </form>

        {lastAction && (
          <div className={`mt-6 p-5 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${
            lastAction.type === 'added' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
            lastAction.type === 'already' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="mt-1">
              <i className={`fas ${
                lastAction.type === 'added' ? 'fa-check-circle text-emerald-600' : 
                lastAction.type === 'already' ? 'fa-exclamation-triangle text-amber-600' : 
                'fa-circle-xmark text-red-600'
              } text-xl`}></i>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg leading-tight">
                {lastAction.type === 'added' && "Voto registrado correctamente"}
                {lastAction.type === 'already' && "Atención: Voto duplicado"}
                {lastAction.type === 'not_found' && "Error: No habilitado"}
              </p>
              <p className="text-sm mt-1 opacity-90 font-medium">
                {lastAction.type === 'added' && `El Tomo ${lastAction.tomo} Folio ${lastAction.folio} ha sido marcado como 'Votó'.`}
                {lastAction.type === 'already' && `El Tomo ${lastAction.tomo} Folio ${lastAction.folio} ya figuraba en el sistema.`}
                {lastAction.type === 'not_found' && `El folio ${lastAction.folio} en el tomo ${lastAction.tomo} no se encuentra habilitado para votar según el padrón cargado.`}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-emerald-700 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Escrutinio Parcial</h3>
          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">En Vivo</span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-4xl font-black">{votedSet.size}</span>
          <span className="opacity-75 font-medium uppercase text-sm tracking-tighter">Votos registrados</span>
        </div>
      </div>
    </div>
  );
};

export default VotingPanel;
