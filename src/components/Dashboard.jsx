import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Vše');
  
  // Nový stav pro modální okno
  const [selectedClient, setSelectedClient] = useState(null);

  const statusOptions = ["Nový", "Čeká na klienta", "Odhad nemovitosti", "Skórink", "Risk", "Podpis", "Žádost"];

  useEffect(() => { fetchCases(); }, []);

  async function fetchCases() {
    const { data } = await supabase.from('cases').select('*').order('id', { ascending: false });
    if (data) setCases(data);
  }

  async function updateClient() {
    if (!selectedClient) return;
    await supabase.from('cases')
      .update({ 
        phone: selectedClient.phone, 
        email: selectedClient.email, 
        amount: selectedClient.amount, 
        notes: selectedClient.notes 
      })
      .eq('id', selectedClient.id);
    setSelectedClient(null);
    fetchCases();
  }

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'Vše' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Moje hypotéky</h1>
      
      {/* Seznam - kliknutím na jméno otevřeš detail */}
      <ul className="space-y-2">
        {filteredCases.map((c) => (
          <li key={c.id} className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-blue-50" onClick={() => setSelectedClient(c)}>
            <span className="font-semibold">{c.client_name}</span> - <span className="text-sm text-gray-500">{c.status}</span>
          </li>
        ))}
      </ul>

      {/* Modální okno pro detail */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Detail: {selectedClient.client_name}</h2>
            
            <input className="w-full p-2 border mb-2" placeholder="Telefon" value={selectedClient.phone || ''} onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value})} />
            <input className="w-full p-2 border mb-2" placeholder="Email" value={selectedClient.email || ''} onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value})} />
            <input className="w-full p-2 border mb-2" type="number" placeholder="Částka" value={selectedClient.amount || ''} onChange={(e) => setSelectedClient({...selectedClient, amount: e.target.value})} />
            <textarea className="w-full p-2 border mb-4" placeholder="Poznámky" value={selectedClient.notes || ''} onChange={(e) => setSelectedClient({...selectedClient, notes: e.target.value})} />
            
            <div className="flex gap-2">
              <button onClick={updateClient} className="bg-blue-600 text-white px-4 py-2 rounded">Uložit</button>
              <button onClick={() => setSelectedClient(null)} className="bg-gray-200 px-4 py-2 rounded">Zrušit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;