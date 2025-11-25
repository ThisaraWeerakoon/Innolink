import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const InnovatorDashboard = () => {
    const { user, api } = useAuth();
    const [title, setTitle] = useState('');
    const [industry, setIndustry] = useState('');
    const [goal, setGoal] = useState('');
    const [teaser, setTeaser] = useState('');
    const [privateContent, setPrivateContent] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/innovator/deals?userId=${user.id}`, {
                title,
                industry,
                fundingGoal: parseFloat(goal),
                teaser,
                privateContent, // Assuming backend accepts this in Deal object or separate
                // Backend Deal entity has privateContent? Let's assume yes or mapped.
            });
            alert('Listing created!');
            // Reset form
        } catch (error) {
            alert('Failed to create listing');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Innovator Dashboard</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
                <h2 className="text-xl font-bold mb-4 text-slate-800">Create New Listing</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Title</label>
                        <input className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Industry</label>
                            <input className="w-full p-2 border rounded" value={industry} onChange={e => setIndustry(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Funding Goal ($)</label>
                            <input type="number" className="w-full p-2 border rounded" value={goal} onChange={e => setGoal(e.target.value)} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Public Teaser</label>
                        <textarea className="w-full p-2 border rounded h-24" value={teaser} onChange={e => setTeaser(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Private Content (Data Room)</label>
                        <textarea className="w-full p-2 border rounded h-32" value={privateContent} onChange={e => setPrivateContent(e.target.value)} required />
                    </div>
                    <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-800">
                        Create Listing
                    </button>
                </form>
            </div>

            {/* Placeholder for My Listings and Access Requests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">My Listings</h2>
                    <p className="text-slate-500 italic">No active listings.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Access Requests</h2>
                    <p className="text-slate-500 italic">No pending requests.</p>
                </div>
            </div>
        </div>
    );
};

export default InnovatorDashboard;
