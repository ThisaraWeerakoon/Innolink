import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { User, MessageSquare, ArrowLeft } from 'lucide-react';

const DealMessages = () => {
    const { dealId } = useParams();
    const { user, api } = useAuth();
    const navigate = useNavigate();
    const [deal, setDeal] = useState(null);
    const [investors, setInvestors] = useState([]);
    const [selectedInvestor, setSelectedInvestor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Deal Details
                // We might need a specific endpoint for single deal or filter from list. 
                // Assuming we can get deal details. For now, let's fetch requests and extract deal info or fetch deal directly if endpoint exists.
                // Let's try fetching requests first as we need them for the list.
                const requestsRes = await api.get(`/innovator/requests?userId=${user.id}`);

                // Filter requests for this deal and approved status
                const dealRequests = requestsRes.data.filter(req =>
                    req.deal.id === dealId &&
                    req.status === 'APPROVED' &&
                    req.introRequested
                );

                setInvestors(dealRequests.map(req => req.investor));

                // Set deal info from the first request if available, or fetch separately if needed.
                if (dealRequests.length > 0) {
                    setDeal(dealRequests[0].deal);
                } else {
                    // Fallback: Fetch deal details directly if no requests yet (though unlikely to be here if no requests)
                    // Or iterate all deals to find this one.
                    const dealsRes = await api.get(`/innovator/deals?userId=${user.id}`);
                    const foundDeal = dealsRes.data.find(d => d.id === dealId);
                    setDeal(foundDeal);
                }

            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user && dealId) {
            fetchData();
        }
    }, [user, dealId, api]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!deal) return <div className="p-8 text-center">Deal not found.</div>;

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center gap-4 shadow-sm">
                <button onClick={() => navigate('/create-deal')} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">{deal.title}</h1>
                    <p className="text-sm text-slate-500">Messaging</p>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Investor List */}
                <div className="w-80 bg-white border-r flex flex-col">
                    <div className="p-4 border-b bg-slate-50">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <User className="w-4 h-4" /> Investors
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {investors.length === 0 ? (
                            <p className="p-4 text-sm text-slate-500 italic">No active conversations.</p>
                        ) : (
                            investors.map(investor => (
                                <button
                                    key={investor.id}
                                    onClick={() => setSelectedInvestor(investor)}
                                    className={`w-full text-left p-4 border-b hover:bg-slate-50 transition-colors flex items-center gap-3 ${selectedInvestor?.id === investor.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
                                >
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                                        {investor.firstName ? investor.firstName[0] : investor.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{investor.firstName} {investor.lastName}</div>
                                        <div className="text-xs text-slate-500 truncate w-48">{investor.email}</div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-100">
                    {selectedInvestor ? (
                        <div className="flex-1 flex flex-col h-full">
                            <div className="bg-white border-b px-6 py-3 flex items-center gap-3 shadow-sm z-10">
                                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                                    {selectedInvestor.firstName ? selectedInvestor.firstName[0] : selectedInvestor.email[0].toUpperCase()}
                                </div>
                                <span className="font-medium text-slate-800">
                                    {selectedInvestor.firstName} {selectedInvestor.lastName} ({selectedInvestor.email})
                                </span>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                <ChatBox dealId={dealId} userId={user.id} recipientId={selectedInvestor.id} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select an investor to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DealMessages;
