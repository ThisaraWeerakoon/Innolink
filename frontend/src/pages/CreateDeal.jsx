import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Upload, ChevronDown, ChevronUp, UserCheck, X, Check } from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';
import ChatBox from '../components/ChatBox';

const CreateDeal = () => {
    const { user, api } = useAuth();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [title, setTitle] = useState('');
    const [industry, setIndustry] = useState('');
    const [goal, setGoal] = useState('');
    const [teaser, setTeaser] = useState('');
    const [expandedDealId, setExpandedDealId] = useState(null);

    useEffect(() => {
        if (user) {
            fetchListings();
            fetchRequests();
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

    const fetchRequests = async () => {
        try {
            const response = await api.get(`/innovator/requests?userId=${user.id}`);
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
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

    const handleApproveRequest = async (requestId) => {
        try {
            await api.put(`/innovator/requests/${requestId}?userId=${user.id}`);
            alert('Request approved!');
            fetchRequests();
        } catch (error) {
            console.error("Failed to approve request:", error);
            alert("Failed to approve request");
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await api.put(`/innovator/requests/${requestId}/reject?userId=${user.id}`);
            alert('Request rejected!');
            fetchRequests();
        } catch (error) {
            console.error("Failed to reject request:", error);
            alert("Failed to reject request");
        }
    };

    const toggleUpload = (dealId) => {
        if (expandedDealId === dealId) {
            setExpandedDealId(null);
        } else {
            setExpandedDealId(dealId);
        }
    };

    const getDealRequests = (dealId) => {
        return requests.filter(req => req.deal.id === dealId && req.status === 'PENDING');
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
                        {listings.map(deal => {
                            const dealRequests = getDealRequests(deal.id);
                            return (
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

                                    {/* Access Requests Section */}
                                    {dealRequests.length > 0 && (
                                        <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100">
                                            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                                <UserCheck className="w-4 h-4" /> Pending Access Requests
                                            </h4>
                                            <div className="space-y-2">
                                                {dealRequests.map(req => (
                                                    <div key={req.id} className="flex justify-between items-center bg-white p-2 rounded border border-blue-100">
                                                        <span className="text-sm text-slate-700 flex items-center gap-1">
                                                            <a href={`/investor/${req.investor.id}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                                                                {req.investor.email}
                                                            </a>
                                                            requested access
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleApproveRequest(req.id)}
                                                                className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                                                title="Approve"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectRequest(req.id)}
                                                                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                                title="Reject"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Uploaded Documents Section */}
                                    {deal.documents && deal.documents.length > 0 && (
                                        <div className="mt-4 bg-slate-50 p-3 rounded-md border border-slate-200">
                                            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4" /> Uploaded Documents
                                            </h4>
                                            <div className="space-y-2">
                                                {deal.documents.map(doc => (
                                                    <div key={doc.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-slate-700">{doc.fileType}</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded ${doc.private ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                                                {doc.private ? 'Private' : 'Public'}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const response = await api.get(`/documents/${doc.id}/download?userId=${user.id}`, {
                                                                        responseType: 'blob',
                                                                    });
                                                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                                                    const link = document.createElement('a');
                                                                    link.href = url;
                                                                    link.setAttribute('download', `${doc.fileType || 'document'}.pdf`);
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    link.remove();
                                                                } catch (error) {
                                                                    console.error("View failed", error);
                                                                    alert("Failed to view document");
                                                                }
                                                            }}
                                                            className="text-xs text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Chat Button */}
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

                                        {/* New Chat Button */}
                                        <button
                                            onClick={() => navigate(`/messages/deal/${deal.id}`)}
                                            disabled={requests.filter(req => req.deal.id === deal.id && req.status === 'APPROVED' && req.introRequested).length === 0}
                                            className={`flex items-center gap-1 text-sm py-1 px-3 rounded ${requests.filter(req => req.deal.id === deal.id && req.status === 'APPROVED' && req.introRequested).length > 0
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <MessageSquare className="w-3 h-3" />
                                            Chat
                                        </button>
                                    </div>

                                    {expandedDealId === deal.id && (
                                        <div className="mt-4 border-t pt-4">
                                            <DocumentUpload dealId={deal.id} onUploadSuccess={() => { setExpandedDealId(null); fetchListings(); }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateDeal;
