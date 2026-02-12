
import React, { useState, useEffect, useMemo } from 'react';
import { Lawyer, GreenVote, AppView } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DataUpload from './components/DataUpload';
import VotingPanel from './components/VotingPanel';
import Reports from './components/Reports';
import SearchModule from './components/SearchModule';
import { processExcelFile } from './utils/excelUtils';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [padron, setPadron] = useState<Lawyer[]>([]);
  const [votosVerdes, setVotosVerdes] = useState<GreenVote[]>([]);
  const [votedSet, setVotedSet] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    const savedPadron = localStorage.getItem('caq_padron');
    const savedVotosVerdes = localStorage.getItem('caq_votos_verdes');
    const savedVoted = localStorage.getItem('caq_voted');

    if (savedPadron) setPadron(JSON.parse(savedPadron));
    if (savedVotosVerdes) setVotosVerdes(JSON.parse(savedVotosVerdes));
    if (savedVoted) setVotedSet(new Set(JSON.parse(savedVoted)));
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('caq_padron', JSON.stringify(padron));
  }, [padron]);

  useEffect(() => {
    localStorage.setItem('caq_votos_verdes', JSON.stringify(votosVerdes));
  }, [votosVerdes]);

  useEffect(() => {
    localStorage.setItem('caq_voted', JSON.stringify(Array.from(votedSet)));
  }, [votedSet]);

  const handleFileUpload = async (type: 'padron' | 'votos-verdes', file: File) => {
    try {
      const data = await processExcelFile(file, type);
      if (type === 'padron') {
        setPadron(data as Lawyer[]);
        alert(`¡Padrón cargado exitosamente! Se encontraron ${data.length} abogados.`);
      } else {
        setVotosVerdes(data as GreenVote[]);
        alert(`¡Votos Verdes cargados! Se encontraron ${data.length} registros proyectados.`);
      }
    } catch (error: any) {
      alert(`Error: ${error}`);
    }
  };

  const toggleVote = (tomo: string, folio: string) => {
    const key = `${tomo}-${folio}`;
    setVotedSet(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const clearData = () => {
    if (window.confirm("¿Está seguro de que desea borrar todos los datos cargados? Esta acción no se puede deshacer.")) {
      setPadron([]);
      setVotosVerdes([]);
      setVotedSet(new Set());
      localStorage.clear();
      setView('dashboard');
    }
  };

  const tomosDisponibles = useMemo(() => {
    const set = new Set(padron.map(l => l.tomo));
    return Array.from(set).sort((a: string, b: string) => parseInt(a) - parseInt(b));
  }, [padron]);

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <div className="no-print">
        <Sidebar currentView={view} setView={setView} onClear={clearData} />
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 no-print">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-700 p-2 rounded-lg shadow-lg">
              <i className="fas fa-balance-scale text-white text-3xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Escrutinio CAQ</h1>
              <p className="text-emerald-600 font-medium">Colegio de Abogados de Quilmes</p>
            </div>
          </div>
          
          <div className="w-full md:w-96">
            <SearchModule searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="animate-fade-in">
          {view === 'dashboard' && (
            <Dashboard 
              padronCount={padron.length} 
              greenCount={votosVerdes.length} 
              votedCount={votedSet.size}
              greenVotedCount={votosVerdes.filter(v => votedSet.has(`${v.tomo}-${v.folio}`)).length}
              onUploadPadron={(file) => handleFileUpload('padron', file)}
              onUploadGreen={(file) => handleFileUpload('votos-verdes', file)}
            />
          )}

          {view === 'padron' && (
            <SearchModule.List 
              title="Padrón Completo"
              data={padron}
              votedSet={votedSet}
              searchTerm={searchTerm}
              onToggleVote={toggleVote}
            />
          )}

          {view === 'votos-verdes' && (
            <SearchModule.List 
              title="Votos Verdes"
              data={votosVerdes}
              votedSet={votedSet}
              searchTerm={searchTerm}
              onToggleVote={toggleVote}
              isGreenList
            />
          )}

          {view === 'votar' && (
            <VotingPanel 
              tomos={tomosDisponibles} 
              padron={padron}
              votedSet={votedSet}
              onVote={toggleVote}
            />
          )}

          {view === 'reportes' && (
            <Reports 
              votosVerdes={votosVerdes} 
              votedSet={votedSet} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
