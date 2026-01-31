import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Users, Activity, Trash2, Ban, Search, Bell, Settings } from 'lucide-react';
import { format } from 'date-fns';

interface UserData {
  id: string;
  email: string;
  role: string;
  createdAt: any; // Firestore Timestamp
  lastLogin?: any;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEncryptions: 0,
    activeNow: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];
      
      // Fetch encryption stats (count total documents in history)
      const historySnapshot = await getDocs(collection(db, 'cipher_history'));
      
      setUsers(usersList);
      setStats({
        totalUsers: usersList.length,
        totalEncryptions: historySnapshot.size,
        activeNow: Math.floor(Math.random() * 10) + 1 // Mock active users
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Role-based Access Control</p>
        </div>
        <div className="flex gap-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
             <input 
               type="text" 
               placeholder="Search users, logs..." 
               className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary"
             />
           </div>
           <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
             <Bell className="h-5 w-5" />
           </button>
           <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
             <Settings className="h-5 w-5" />
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</h3>
              <p className="text-emerald-400 text-xs mt-2 flex items-center">
                <span className="mr-1">↑</span> +5.2% vs last month
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm">Total Encryptions</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.totalEncryptions}</h3>
              <p className="text-emerald-400 text-xs mt-2 flex items-center">
                <span className="mr-1">↑</span> +12.8% vs last month
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <Activity className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm">Active Now</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.activeNow}</h3>
              <p className="text-rose-400 text-xs mt-2 flex items-center">
                <span className="mr-1">↓</span> -2.1% from peak today
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Registered Users</h3>
          <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            + Add User
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900 text-slate-200 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                 <tr><td colSpan={5} className="px-6 py-8 text-center">Loading users...</td></tr>
              ) : users.length === 0 ? (
                 <tr><td colSpan={5} className="px-6 py-8 text-center">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white">
                          {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.email || 'No Email'}</div>
                          <div className="text-xs">{user.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-600/20 text-slate-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.createdAt?.toDate ? format(user.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        <span className="text-white">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1 hover:text-white transition-colors" title="Ban User">
                          <Ban className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 hover:text-red-400 transition-colors" 
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
