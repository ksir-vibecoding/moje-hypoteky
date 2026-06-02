import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Vše');
  const [selectedClient, setSelectedClient] = useState(null);

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

  async function deleteClient(e, id) {
    e.stopPropagation(); // Zabrání otevření modálního okna při kliku na smazat
    await supabase.from('cases').delete().eq('id', id);
    fetchCases();
  }

  async function updateStatus(e, id, newStatus) {
    e.stopPropagation(); // Zabrání otevření modálního okna
    await supabase.from('cases').update({ status: newStatus }).eq('id', id);
    fetchCases();
  }

  async function saveClientDetails() {
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
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Moje hypotéky</h1>

      <ul className="space-y-3">
        {filteredCases.map((c) => (
          <li key={c.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
  
  {/* Detail se otevře pouze při kliku na jméno */}
  <span 
    className="w-1/3 font-medium cursor-pointer text-blue-600 hover:underline" 
    onClick={() => setSelectedClient(c)}
  >
    {c.client_name}
  </span>
  
  <div className="flex gap-2 items-center">
    <select 
      value={c.status} 
      onChange={(e) => updateStatus(e, c.id, e.target.value)} 
      className="text-xs p-1 rounded bg-gray-100 cursor-pointer"
    >
      {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    
    <button 
      onClick={(e) => deleteClient(e, c.id)} 
      className="text-red-500 text-xs hover:text-red-700"
    >
      Smazat
    </button>
  </div>
</li>
        ))}
      </ul>

      {/* Modální okno */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{selectedClient.client_name}</h2>
            <div className="space-y-3">
              <input className="w-full p-2 border rounded" placeholder="Telefon" value={selectedClient.phone || ''} onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value})} />
              <input className="w-full p-2 border rounded" placeholder="Email" value={selectedClient.email || ''} onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value})} />
              <input className="w-full p-2 border rounded" type="number" placeholder="Částka" value={selectedClient.amount || ''} onChange={(e) => setSelectedClient({...selectedClient, amount: e.target.value})} />
              <textarea className="w-full p-2 border rounded h-20" placeholder="Poznámky" value={selectedClient.notes || ''} onChange={(e) => setSelectedClient({...selectedClient, notes: e.target.value})} />
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={saveClientDetails} className="flex-1 bg-blue-600 text-white py-2 rounded">Uložit</button>
              <button onClick={() => setSelectedClient(null)} className="flex-1 bg-gray-200 py-2 rounded">Zrušit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;