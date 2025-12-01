import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';

const CreateDeal = () => {
    const { user, api } = useAuth();
    const [listings, setListings] = useState([]);
    const [title, setTitle] = useState('');
    const [industry, setIndustry] = useState('');
    const [goal, setGoal] = useState('');
    const [teaser, setTeaser] = useState('');
    const [expandedDealId, setExpandedDealId] = useState(null);

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
            await api.post(`/innovator/deals?userId=${user.id}`, {
                title,
                industry,
                targetAmount: parseFloat(goal),
                teaserSummary: teaser,
            });

            alert('Listing created! You can now upload documents below.');
            // Reset form
            setTitle('');
            setIndustry('');
            setGoal('');
            setTeaser('');
            fetchListings(); // Refresh listings
        } catch (error) {
            console.error("Deal Creation Error:", error);
            alert(`Failed to create listing: ${error.response?.data?.message || error.message}`);
        }
    };

    const toggleUpload = (dealId) => {
        if (expandedDealId === dealId) {
            setExpandedDealId(null);
        } else {
            setExpandedDealId(dealId);
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
                            <div key={deal.id} className="border p-4 rounded hover:bg-slate-50 transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{deal.title}</h3>
                                        <p className="text-sm text-slate-600">{deal.industry}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-0.5 rounded text-xs ${deal.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : deal.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {deal.status}
                                        </span>
                                        <div className="font-semibold text-emerald-600 mt-1">${deal.targetAmount.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    {deal.status === 'DRAFT' && (
                                        <button
                                            onClick={() => handleSubmitForApproval(deal.id)}
                                            className="bg-blue-600 text-white text-sm py-1 px-3 rounded hover:bg-blue-700"
                                        >
                                            Submit for Approval
                                        </button>
                                    )}
                                    <button
                                        onClick={() => toggleUpload(deal.id)}
                                        className="flex items-center gap-1 bg-slate-100 text-slate-700 text-sm py-1 px-3 rounded hover:bg-slate-200"
                                    >
                                        <Upload className="w-3 h-3" />
                                        {expandedDealId === deal.id ? 'Hide Upload' : 'Upload Documents'}
                                        {expandedDealId === deal.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                </div>

                                {expandedDealId === deal.id && (
                                    <div className="mt-4 border-t pt-4">
                                        <DocumentUpload dealId={deal.id} onUploadSuccess={() => setExpandedDealId(null)} />
                                    </div>
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
