import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Vše');
  
  // Stav pro modální okno (kdo je zrovna vybraný k úpravě)
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

  // Funkce, která po kliknutí na "Uložit" pošle data do Supabase
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
      
    setSelectedClient(null); // Zavře okno
    fetchCases(); // Aktualizuje seznam
  }

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'Vše' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Moje hypotéky</h1>

      {/* Seznam klientů - kliknutím na jméno se otevře modální okno */}
      <ul className="space-y-3">
        {filteredCases.map((c) => (
          <li key={c.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer hover:border-blue-300 transition" 
              onClick={() => setSelectedClient(c)}>
            <span className="font-medium text-gray-800">{c.client_name}</span>
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">{c.status}</span>
          </li>
        ))}
      </ul>

      {/* MODÁLNÍ OKNO - zobrazení detailu */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{selectedClient.client_name}</h2>
            
            <div className="space-y-3">
              <input className="w-full p-2 border rounded-lg" placeholder="Telefon" value={selectedClient.phone || ''} onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value})} />
              <input className="w-full p-2 border rounded-lg" placeholder="Email" value={selectedClient.email || ''} onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value})} />
              <input className="w-full p-2 border rounded-lg" type="number" placeholder="Částka (Kč)" value={selectedClient.amount || ''} onChange={(e) => setSelectedClient({...selectedClient, amount: e.target.value})} />
              <textarea className="w-full p-2 border rounded-lg h-24" placeholder="Poznámky..." value={selectedClient.notes || ''} onChange={(e) => setSelectedClient({...selectedClient, notes: e.target.value})} />
            </div>
            
            <div className="flex gap-2 mt-6">
              <button onClick={saveClientDetails} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Uložit</button>
              <button onClick={() => setSelectedClient(null)} className="flex-1 bg-gray-100 py-2 rounded-lg font-semibold hover:bg-gray-200">Zrušit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;