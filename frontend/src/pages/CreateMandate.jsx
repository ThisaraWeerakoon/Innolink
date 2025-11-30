import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateMandate = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [newMandate, setNewMandate] = useState({
        title: '',
        description: '',
        targetIndustry: '',
        stagePreference: '',
        minTicketSize: '',
        maxTicketSize: '',
        geography: '',
        currency: 'USD'
    });

    const handleCreateMandate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/mandates', newMandate);
            alert('Mandate created successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to create mandate:", error);
            alert('Failed to create mandate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Mandate</h2>
                <form onSubmit={handleCreateMandate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={newMandate.title}
                            onChange={(e) => setNewMandate({ ...newMandate, title: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                            required
                            placeholder="e.g. Green Energy Fund"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={newMandate.description}
                            onChange={(e) => setNewMandate({ ...newMandate, description: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                            required
                            rows="4"
                            placeholder="Describe your investment thesis..."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Target Industry</label>
                            <input
                                type="text"
                                value={newMandate.targetIndustry}
                                onChange={(e) => setNewMandate({ ...newMandate, targetIndustry: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                required
                                placeholder="e.g. Fintech"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Stage Preference</label>
                            <select
                                value={newMandate.stagePreference}
                                onChange={(e) => setNewMandate({ ...newMandate, stagePreference: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                required
                            >
                                <option value="">Select Stage</option>
                                <option value="Pre-Seed">Pre-Seed</option>
                                <option value="Seed">Seed</option>
                                <option value="Series A">Series A</option>
                                <option value="Series B+">Series B+</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Min Ticket Size</label>
                            <input
                                type="number"
                                value={newMandate.minTicketSize}
                                onChange={(e) => setNewMandate({ ...newMandate, minTicketSize: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                required
                                placeholder="e.g. 100000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Max Ticket Size</label>
                            <input
                                type="number"
                                value={newMandate.maxTicketSize}
                                onChange={(e) => setNewMandate({ ...newMandate, maxTicketSize: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                required
                                placeholder="e.g. 1000000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Geography</label>
                            <input
                                type="text"
                                value={newMandate.geography}
                                onChange={(e) => setNewMandate({ ...newMandate, geography: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                required
                                placeholder="e.g. Global"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                            <select
                                value={newMandate.currency}
                                onChange={(e) => setNewMandate({ ...newMandate, currency: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Mandate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMandate;
