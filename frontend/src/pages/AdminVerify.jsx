import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminVerify = () => {
    const { api } = useAuth();
    const [users, setUsers] = useState([]);
    const [deals, setDeals] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDeals = async () => {
        try {
            const res = await api.get('/admin/deals/pending');
            setDeals(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchDeals();
    }, []);

    const handleVerify = async (id) => {
        try {
            await api.put(`/admin/verify/${id}`);
            fetchUsers();
        } catch (error) {
            alert('Verification failed');
        }
    };

    const handleApproveDeal = async (id) => {
        try {
            await api.put(`/admin/deals/${id}/approve`);
            fetchDeals();
        } catch (error) {
            alert('Approval failed');
        }
    };

    const handleRejectDeal = async (id) => {
        try {
            await api.put(`/admin/deals/${id}/reject`);
            fetchDeals();
        } catch (error) {
            alert('Rejection failed');
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

            <h1 className="text-3xl font-bold mb-6 mt-12 text-slate-900">Pending Deals</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Title</th>
                            <th className="p-4 font-semibold text-slate-600">Innovator</th>
                            <th className="p-4 font-semibold text-slate-600">Amount</th>
                            <th className="p-4 font-semibold text-slate-600">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deals.map(deal => (
                            <tr key={deal.id} className="border-b border-slate-100">
                                <td className="p-4">{deal.title}</td>
                                <td className="p-4">{deal.innovator?.email || 'Unknown'}</td>
                                <td className="p-4">${deal.targetAmount.toLocaleString()}</td>
                                <td className="p-4 space-x-2">
                                    <button
                                        onClick={() => handleApproveDeal(deal.id)}
                                        className="bg-emerald-600 text-white px-4 py-1 rounded hover:bg-emerald-700 text-sm"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleRejectDeal(deal.id)}
                                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm"
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {deals.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-slate-500">No pending deals</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default AdminVerify;
