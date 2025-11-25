import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminVerify = () => {
    const { api } = useAuth();
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.filter(u => !u.verified));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleVerify = async (id) => {
        try {
            await api.put(`/admin/verify/${id}`);
            fetchUsers();
        } catch (error) {
            alert('Verification failed');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-900">Pending Verifications</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Email</th>
                            <th className="p-4 font-semibold text-slate-600">Role</th>
                            <th className="p-4 font-semibold text-slate-600">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-slate-100">
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'INVESTOR' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleVerify(user.id)}
                                        className="bg-emerald-600 text-white px-4 py-1 rounded hover:bg-emerald-700 text-sm"
                                    >
                                        Verify
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="3" className="p-8 text-center text-slate-500">No pending verifications</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminVerify;
