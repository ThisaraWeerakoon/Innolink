import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DealCard from '../components/DealCard';
import { Search, Filter, Bookmark, Clock, Zap } from 'lucide-react';

const InvestorDashboard = () => {
    const { api } = useAuth();
    const [activeTab, setActiveTab] = useState('best_matches');
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedDealIds, setSavedDealIds] = useState(new Set());

    // Dummy data for "Best Matches" and "Saved Deals"
    const dummyBestMatches = [
        { id: 'dm1', title: 'EcoTech Solutions', industry: 'Clean Energy', targetAmount: 500000, teaserSummary: 'Revolutionary solar panel technology for residential use.', status: 'ACTIVE', location: 'San Francisco, CA' },
        { id: 'dm2', title: 'HealthAI', industry: 'Healthcare', targetAmount: 1200000, teaserSummary: 'AI-powered diagnostic tool for early cancer detection.', status: 'ACTIVE', location: 'Boston, MA' },
        { id: 'dm3', title: 'FinFlow', industry: 'Fintech', targetAmount: 750000, teaserSummary: 'Next-gen payment processing for small businesses.', status: 'ACTIVE', location: 'New York, NY' },
    ];

    const dummySavedDeals = [
        { id: 'ds1', title: 'AgriSmart', industry: 'Agriculture', targetAmount: 300000, teaserSummary: 'IoT sensors for optimizing crop yield.', status: 'ACTIVE', location: 'Austin, TX' },
    ];

    useEffect(() => {
        fetchDeals();
    }, [activeTab]);

    const fetchDeals = async () => {
        setLoading(true);
        try {
            // Always fetch saved deals to check status
            const savedResponse = await api.get('/deals/saved');
            const savedIds = new Set(savedResponse.data.map(d => d.id));
            setSavedDealIds(savedIds);

            if (activeTab === 'most_recent') {
                const response = await api.get('/deals?sortBy=recent');
                setDeals(response.data);
            } else if (activeTab === 'best_matches') {
                // Fetch all active deals for now
                const response = await api.get('/deals');
                setDeals(response.data);
            } else if (activeTab === 'saved_deals') {
                setDeals(savedResponse.data);
            }
        } catch (error) {
            console.error("Failed to fetch deals:", error);
            setDeals([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = async (dealId) => {
        try {
            if (savedDealIds.has(dealId)) {
                await api.delete(`/deals/${dealId}/save`);
                const newSaved = new Set(savedDealIds);
                newSaved.delete(dealId);
                setSavedDealIds(newSaved);

                // If on saved tab, remove from list
                if (activeTab === 'saved_deals') {
                    setDeals(prev => prev.filter(d => d.id !== dealId));
                }
            } else {
                await api.post(`/deals/${dealId}/save`);
                const newSaved = new Set(savedDealIds);
                newSaved.add(dealId);
                setSavedDealIds(newSaved);
            }
        } catch (error) {
            console.error("Failed to toggle save:", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Find Deals</h1>
                        <p className="text-slate-500 mt-2">Discover investment opportunities tailored to your preferences.</p>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-slate-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('best_matches')}
                                className={`${activeTab === 'best_matches' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                Best Matches
                            </button>
                            <button
                                onClick={() => setActiveTab('most_recent')}
                                className={`${activeTab === 'most_recent' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                            >
                                <Clock className="w-4 h-4 mr-2" />
                                Most Recent
                            </button>
                            <button
                                onClick={() => setActiveTab('saved_deals')}
                                className={`${activeTab === 'saved_deals' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                            >
                                <Bookmark className="w-4 h-4 mr-2" />
                                Saved Deals ({savedDealIds.size})
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {deals.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-slate-500">No deals found.</p>
                                </div>
                            ) : (
                                deals.map(deal => (
                                    <DealCard
                                        key={deal.id}
                                        deal={deal}
                                        isSaved={savedDealIds.has(deal.id)}
                                        onToggleSave={toggleSave}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-80 space-y-6">
                    {/* Profile Summary */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl">
                                I
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Investor Profile</h3>
                                <p className="text-sm text-slate-500">Complete your profile</p>
                            </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                            <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">40% completed</p>
                        <button className="w-full border border-emerald-600 text-emerald-600 rounded py-2 text-sm font-medium hover:bg-emerald-50">
                            Edit Profile
                        </button>
                    </div>

                    {/* Promote */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-2">Promote with ads</h3>
                        <p className="text-sm text-slate-500 mb-4">Boost your visibility to top startups.</p>
                        <button className="text-emerald-600 text-sm font-medium hover:underline">
                            Learn more
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestorDashboard;
