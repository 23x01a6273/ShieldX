import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { Download, Filter } from 'lucide-react';

interface HistoryItem {
  id: string;
  inputText: string;
  outputText: string;
  shiftKey: number;
  createdAt: any;
  action?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'cipher_history'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoryItem[];

      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* User Profile Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center text-3xl font-bold text-slate-400">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {user?.displayName || 'User'}
            </h2>
            <p className="text-slate-400">{user?.email}</p>
            <div className="mt-2 flex gap-2">
              <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
                Pro Member
              </span>
              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                Active
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:items-end gap-2">
           <div className="text-slate-400 text-sm">Total Encryptions</div>
           <div className="text-4xl font-bold text-primary">{history.length}</div>
           <button className="text-sm text-slate-300 hover:text-white border border-slate-600 px-3 py-1 rounded-md transition-colors">
             Edit Profile
           </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" /> Encryption History
          </h3>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <Filter className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No encryption history found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900 text-slate-200 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Input Message</th>
                  <th className="px-6 py-4">Shift</th>
                  <th className="px-6 py-4">Output Cipher</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-300 truncate max-w-xs" title={item.inputText}>
                      {item.inputText}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs font-mono text-white">
                        {item.shiftKey}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-primary truncate max-w-xs" title={item.outputText}>
                      {item.outputText}
                    </td>
                    <td className="px-6 py-4">
                      {item.createdAt?.toDate ? format(item.createdAt.toDate(), 'MMM dd, yyyy') : 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {history.length > 0 && (
           <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
             <button className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50">Previous</button>
             <button className="px-3 py-1 bg-primary text-white rounded hover:bg-blue-600">1</button>
             <button className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50">Next</button>
           </div>
        )}
      </div>
    </div>
  );
};

// Helper for icon
function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  )
}

export default Dashboard;
