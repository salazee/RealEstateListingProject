// // src/pages/admin/Users.jsx(User management)
// import { useState, useEffect } from 'react';
// import { getAllUsers, deleteUser } from '../../Utils/admin';
// import { toast } from 'react-hot-toast';

// export default function AdminUsers() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const res = await getAllUsers();
//       setUsers(res.data.users || []);
//     } catch (error){
//       toast.error('Failed to load users');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id, name) => {
//     if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
//     try {
//       await deleteUser(id);
//       setUsers(users.filter(u => u._id !== id));
//       toast.success('User deleted');
//     } catch (error){
//       toast.error('Failed to delete user');
//     }
//   };

//   const filteredUsers = users.filter(u =>
//     u.name.toLowerCase().includes(search.toLowerCase()) ||
//     u.email.toLowerCase().includes(search.toLowerCase())
//   );

//   if (loading) return <div className="p-6">Loading users...</div>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      
//       <input
//         type="text"
//         placeholder="Search by name or email..."
//         className="w-full p-2 border rounded mb-4"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white border">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="py-2 px-4 border">Name</th>
//               <th className="py-2 px-4 border">Email</th>
//               <th className="py-2 px-4 border">Role</th>
//               <th className="py-2 px-4 border">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredUsers.map(user => (
//               <tr key={user._id} className="text-center">
//                 <td className="py-2 px-4 border">{user.name}</td>
//                 <td className="py-2 px-4 border">{user.email}</td>
//                 <td className="py-2 px-4 border">
//                   <span className={`px-2 py-1 rounded text-xs ${
//                     user.role === 'admin' ? 'bg-red-100 text-red-800' :
//                     user.role === 'seller' ? 'bg-yellow-100 text-yellow-800' :
//                     'bg-blue-100 text-blue-800'
//                   }`}>
//                     {user.role}
//                   </span>
//                 </td>
//                 <td className="py-2 px-4 border">
//                   {user.role !== 'admin' && (
//                     <button
//                       onClick={() => handleDelete(user._id, user.name)}
//                       className="text-red-600 hover:underline text-sm"
//                     >
//                       Delete
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }



// src/pages/admin/User.jsx
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAllUsers, deleteUser, updateUser } from '../../utils/admin';
import { toast } from 'react-hot-toast';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const context = useOutletContext();
  const refreshDashboard = context?.refreshDashboard;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This action cannot be undone.`)) return;

    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== id));
      
      // Refresh parent dashboard stats
      if (refreshDashboard) refreshDashboard();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUpdateRole = async (userId, currentName) => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    try {
      await updateUser(userId, selectedRole);
      toast.success(`Updated ${currentName}'s role to ${selectedRole}`);
      
      // Update local state
      setUsers(users.map(u => 
        u._id === userId ? { ...u, role: selectedRole } : u
      ));
      
      setEditingUserId(null);
      setSelectedRole('');
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const startEditing = (userId, currentRole) => {
    setEditingUserId(userId);
    setSelectedRole(currentRole);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setSelectedRole('');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'seller': return 'bg-blue-100 text-blue-800';
      case 'buyer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block w-8 h-8 border-4 border-t-blue-600 border-solid rounded-full animate-spin"></div>
        <p className="mt-2">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">User Management ({users.length})</h2>
        <button
          onClick={fetchUsers}
          className="text-sm text-blue-600 hover:underline"
        >
          🔄 Refresh
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                  Email
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                  Role
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                  Verified
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                  Joined
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium">{user.name}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    {editingUserId === user._id ? (
                      <div className="flex gap-2">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="">Select...</option>
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleUpdateRole(user._id, user.name)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                        <button
                          onClick={() => startEditing(user._id, user.role)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit role"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {user.isVerified ? (
                      <span className="text-green-600 text-sm">✓ Verified</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not verified</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(user._id, user.name)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      title="Delete user"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                 </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'buyer').length}
            </p>
            <p className="text-sm text-gray-600">Buyers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'seller').length}
            </p>
            <p className="text-sm text-gray-600">Sellers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </p>
            <p className="text-sm text-gray-600">Admins</p>
          </div>
        </div>
      </div>
    </div>
  );
}