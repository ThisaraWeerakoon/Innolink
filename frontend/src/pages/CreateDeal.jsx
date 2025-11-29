import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare } from 'lucide-react';

const CreateDeal = () => {
    const { user, api } = useAuth();
    const [listings, setListings] = useState([]);
    const [title, setTitle] = useState('');
    const [industry, setIndustry] = useState('');
    const [goal, setGoal] = useState('');
    const [teaser, setTeaser] = useState('');
    const [docUrl, setDocUrl] = useState('');
    const [docType, setDocType] = useState('PITCH_DECK');

    useEffect(() => {
        if (user) {
            fetchListings();
        }
    }, [user]);

    const fetchListings = async () => {
        try {
            const response = await api.get(`/innovator/deals?userId=${user.id}`);
            setListings(response.data);
        } catch (error) {
            console.error("Failed to fetch listings:", error);
        }
    };

    const handleSubmitForApproval = async (dealId) => {
        try {
            await api.post(`/innovator/deals/${dealId}/submit?userId=${user.id}`);
            alert('Deal submitted for approval!');
            fetchListings();
        } catch (error) {
            console.error("Failed to submit deal:", error);
            alert(`Failed to submit: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const dealResponse = await api.post(`/innovator/deals?userId=${user.id}`, {
                title,
                industry,
                targetAmount: parseFloat(goal),
                teaserSummary: teaser,
            });

            if (docUrl) {
                await api.post(`/innovator/deals/${dealResponse.data.id}/documents?userId=${user.id}`, {
                    fileUrl: docUrl,
                    fileType: docType,
                    isPrivate: true
                });
            }
            alert('Listing created!');
            // Reset form
            setTitle('');
            setIndustry('');
            setGoal('');
            setTeaser('');
            setDocUrl('');
            fetchListings(); // Refresh listings
        } catch (error) {
            console.error("Deal Creation Error:", error);
            alert(`Failed to create listing: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto relative">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Create & Manage Deals</h1>

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
                        <label className="block text-sm font-medium text-slate-700">Private Document URL</label>
                        <input className="w-full p-2 border rounded" value={docUrl} onChange={e => setDocUrl(e.target.value)} placeholder="https://example.com/pitch-deck.pdf" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Document Type</label>
                        <select className="w-full p-2 border rounded" value={docType} onChange={e => setDocType(e.target.value)}>
                            <option value="PITCH_DECK">Pitch Deck</option>
                            <option value="FINANCIALS">Financials</option>
                            <option value="LEGAL">Legal</option>
                        </select>
                    </div>
                    <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-800">
                        Create Listing
                    </button>
                </form>
            </div>

            {/* My Listings */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-4 text-slate-800">My Listings</h2>
                {listings.length === 0 ? (
                    <p className="text-slate-500 italic">No active listings.</p>
                ) : (
                    <div className="space-y-4">
                        {listings.map(deal => (
                            <div key={deal.id} className="border p-4 rounded hover:bg-slate-50">
                                <h3 className="font-bold text-lg">{deal.title}</h3>
                                <p className="text-sm text-slate-600">{deal.industry}</p>
                                <div className="flex justify-between mt-2 text-sm">
                                    <span className="font-semibold text-emerald-600">${deal.targetAmount.toLocaleString()}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${deal.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : deal.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {deal.status}
                                    </span>
                                </div>
                                {deal.status === 'DRAFT' && (
                                    <button
                                        onClick={() => handleSubmitForApproval(deal.id)}
                                        className="mt-3 w-full bg-blue-600 text-white text-sm py-1 rounded hover:bg-blue-700"
                                    >
                                        Submit for Approval
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateDeal;
