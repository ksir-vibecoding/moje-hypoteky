import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [newName, setNewName] = useState('');

  // 1. Nové stavy pro vyhledávání a filtrování
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Vše');

  const statusOptions = ["Nový", "Čeká na klienta", "Odhad nemovitosti", "Skórink", "Risk", "Podpis", "Žádost"];

  useEffect(() => { fetchCases(); }, []);

  async function fetchCases() {
    const { data } = await supabase.from('cases').select('*').order('id', { ascending: false });
    if (data) setCases(data);
  }

  async function addClient() {
    if (!newName) return;
    await supabase.from('cases').insert([{ client_name: newName, status: 'Nový' }]);
    setNewName('');
    fetchCases();
  }

  async function deleteClient(id) {
    await supabase.from('cases').delete().eq('id', id);
    fetchCases();
  }

  async function updateStatus(id, newStatus) {
    await supabase.from('cases').update({ status: newStatus }).eq('id', id);
    fetchCases();
  }

  // 2. Logika pro filtrování seznamu v reálném čase
  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'Vše' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Moje hypotéky</h1>

      {/* Formulář pro přidání klienta */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 flex gap-2">
        <input 
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Jméno nového klienta..." 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)} 
        />
        <button 
          onClick={addClient} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Přidat
        </button>
      </div>

      {/* 3. Panel pro vyhledávání a filtrování */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hledat klienta</label>
          <input 
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Napiš jméno..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stav hypotéky</label>
          <select 
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Vše">Zobrazit vše</option>
            {statusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Seznam klientů - nyní vykresluje profiltrované pole filteredCases */}
      <ul className="space-y-3">
        {filteredCases.map((c) => (
          <li key={c.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
            <span className="font-medium text-gray-700 w-1/3">{c.client_name}</span>
            
            <div className="flex gap-4 items-center">
              <select 
                value={c.status}
                onChange={(e) => updateStatus(c.id, e.target.value)}
                className="bg-gray-100 text-gray-700 text-sm font-semibold py-1 px-3 rounded-full border-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <button 
                onClick={() => deleteClient(c.id)} 
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Smazat
              </button>
            </div>
          </li>
        ))}

        {/* Informace pro případ, že vyhledávání nic nenašlo */}
        {filteredCases.length === 0 && (
          <p className="text-center text-gray-400 py-4 text-sm">Žádný klient neodpovídá zadání.</p>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;