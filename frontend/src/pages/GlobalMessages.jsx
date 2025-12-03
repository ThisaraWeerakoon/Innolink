import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { User, MessageSquare, ChevronDown, Check } from 'lucide-react';

const GlobalMessages = () => {
    const { dealId } = useParams();
    const { user, api } = useAuth();
    const navigate = useNavigate();

    // Common State
    const [loading, setLoading] = useState(true);

    // Innovator State
    const [deals, setDeals] = useState([]);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [investors, setInvestors] = useState([]);
    const [selectedInvestor, setSelectedInvestor] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Investor State
    const [investorDeals, setInvestorDeals] = useState([]);
    const [selectedInvestorDeal, setSelectedInvestorDeal] = useState(null);

    // 1. Fetch Data based on Role
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user.role === 'INNOVATOR') {
                    // --- INNOVATOR LOGIC ---
                    const res = await api.get(`/innovator/deals?userId=${user.id}`);
                    setDeals(res.data);

                    if (dealId) {
                        const found = res.data.find(d => d.id === dealId);
                        if (found) setSelectedDeal(found);
                    } else if (res.data.length > 0) {
                        setSelectedDeal(res.data[0]);
                    }
                } else if (user.role === 'INVESTOR') {
                    // --- INVESTOR LOGIC ---
                    // Fetch requests to find deals where intro is requested & approved
                    const requestsRes = await api.get(`/investor/requests?userId=${user.id}`);

                    // Filter: Approved AND Intro Requested
                    const activeRequests = requestsRes.data.filter(req =>
                        req.status === 'APPROVED' && req.introRequested
                    );

                    // Extract Deals
                    const dealsList = activeRequests.map(req => req.deal);
                    setInvestorDeals(dealsList);

                    if (dealId) {
                        const found = dealsList.find(d => d.id === dealId);
                        if (found) setSelectedInvestorDeal(found);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, api, dealId]);

    // 2. Innovator: Fetch Investors when Deal Changes
    useEffect(() => {
        const fetchInvestors = async () => {
            if (user.role !== 'INNOVATOR' || !selectedDeal) return;

            try {
                const requestsRes = await api.get(`/innovator/requests?userId=${user.id}`);
                const dealRequests = requestsRes.data.filter(req =>
                    req.deal.id === selectedDeal.id &&
                    req.status === 'APPROVED' &&
                    req.introRequested
                );
                setInvestors(dealRequests.map(req => req.investor));
                setSelectedInvestor(null);
            } catch (error) {
                console.error("Failed to fetch investors", error);
            }
        };

        fetchInvestors();
    }, [selectedDeal, user, api]);


    const handleDealSelect = (deal) => {
        setSelectedDeal(deal);
        setIsDropdownOpen(false);
        navigate(`/messages/deal/${deal.id}`, { replace: true });
    };

    const handleInvestorDealSelect = (deal) => {
        setSelectedInvestorDeal(deal);
        navigate(`/messages/deal/${deal.id}`, { replace: true });
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading messages...</div>;

    // --- RENDER FOR INVESTOR ---
    if (user.role === 'INVESTOR') {
        return (
            <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
                {/* Simple Header */}
                <div className="bg-white border-b px-6 py-4 shadow-sm z-20">
                    <h1 className="text-xl font-bold text-slate-800">Messages</h1>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar: Deal List */}
                    <div className="w-80 bg-white border-r flex flex-col">
                        <div className="p-4 border-b bg-slate-50">
                            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Active Conversations
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {investorDeals.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-slate-500 italic mb-2">No active conversations.</p>
                                    <p className="text-xs text-slate-400">Request introductions on deals to start chatting.</p>
                                </div>
                            ) : (
                                investorDeals.map(deal => (
                                    <button
                                        key={deal.id}
                                        onClick={() => handleInvestorDealSelect(deal)}
                                        className={`w-full text-left p-4 border-b hover:bg-slate-50 transition-colors flex items-center gap-3 ${selectedInvestorDeal?.id === deal.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
                                    >
                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold shrink-0">
                                            {deal.title[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-slate-900 truncate">{deal.title}</div>
                                            <div className="text-xs text-slate-500 truncate">{deal.industry}</div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col bg-slate-100">
                        {selectedInvestorDeal ? (
                            <div className="flex-1 flex flex-col h-full">
                                <div className="bg-white border-b px-6 py-3 flex items-center gap-3 shadow-sm z-10">
                                    <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                                        I
                                    </div>
                                    <span className="font-medium text-slate-800">
                                        Innovator ({selectedInvestorDeal.innovator?.email || 'Innovator'})
                                    </span>
                                </div>
                                <div className="flex-1 overflow-hidden relative">
                                    <ChatBox
                                        dealId={selectedInvestorDeal.id}
                                        userId={user.id}
                                        recipientId={selectedInvestorDeal.innovator?.id}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                                <p>Select a deal to chat with the innovator</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER FOR INNOVATOR (Existing Logic) ---
    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
            {/* Header with Dropdown */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm z-20 relative">
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-emerald-600 transition-colors"
                    >
                        {selectedDeal ? selectedDeal.title : 'Select a Deal'}
                        <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <p className="text-sm text-slate-500 mt-1">Messaging</p>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 max-h-96 overflow-y-auto">
                            {deals.length > 0 ? (
                                deals.map(deal => (
                                    <button
                                        key={deal.id}
                                        onClick={() => handleDealSelect(deal)}
                                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between group ${selectedDeal?.id === deal.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'}`}
                                    >
                                        <span className="font-medium truncate">{deal.title}</span>
                                        {selectedDeal?.id === deal.id && <Check className="w-4 h-4 text-emerald-600" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-slate-500 italic">No deals found</div>
                            )}
                        </div>
                    )}
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
                            <div className="p-8 text-center">
                                <p className="text-sm text-slate-500 italic mb-2">No active conversations.</p>
                                <p className="text-xs text-slate-400">Investors who express interest will appear here.</p>
                            </div>
                        ) : (
                            investors.map(investor => (
                                <button
                                    key={investor.id}
                                    onClick={() => setSelectedInvestor(investor)}
                                    className={`w-full text-left p-4 border-b hover:bg-slate-50 transition-colors flex items-center gap-3 ${selectedInvestor?.id === investor.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
                                >
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold shrink-0">
                                        {investor.firstName ? investor.firstName[0] : investor.email[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium text-slate-900 truncate">
                                            {investor.firstName ? `${investor.firstName} ${investor.lastName}` : investor.email}
                                        </div>
                                        <div className="text-xs text-slate-500 truncate">{investor.email}</div>
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
                                    {selectedInvestor.firstName ? `${selectedInvestor.firstName} ${selectedInvestor.lastName}` : selectedInvestor.email}
                                </span>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                <ChatBox dealId={selectedDeal.id} userId={user.id} recipientId={selectedInvestor.id} />
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

export default GlobalMessages;
