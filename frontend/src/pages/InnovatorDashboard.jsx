import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MandateCard from '../components/MandateCard';
import { Search, Filter, Bookmark, Clock, Zap } from 'lucide-react';

const InnovatorDashboard = () => {
    const { api } = useAuth();
    const [activeTab, setActiveTab] = useState('best_matches');
    const [mandates, setMandates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedMandateIds, setSavedMandateIds] = useState(new Set());

    // Dummy data for "Best Matches" and "Saved Mandates"
    const dummyBestMatches = [
        { id: 'mm1', title: 'Green Energy Fund', industryPreference: 'Clean Energy', minInvestment: 100000, maxInvestment: 1000000, stagePreference: 'Seed', description: 'Looking for innovative solar and wind projects.' },
        { id: 'mm2', title: 'Health Tech Ventures', industryPreference: 'Healthcare', minInvestment: 500000, maxInvestment: 2000000, stagePreference: 'Series A', description: 'Focusing on AI-driven diagnostic tools.' },
    ];

    const dummySavedMandates = [
        { id: 'ms1', title: 'AgriTech Capital', industryPreference: 'Agriculture', minInvestment: 200000, maxInvestment: 500000, stagePreference: 'Pre-Seed', description: 'Supporting sustainable farming solutions.' },
    ];

    useEffect(() => {
        fetchMandates();
    }, [activeTab]);

    const fetchMandates = async () => {
        setLoading(true);
        try {
            // Always fetch saved mandates to check status
            const savedResponse = await api.get('/mandates/saved');
            const savedIds = new Set(savedResponse.data.map(m => m.id));
            setSavedMandateIds(savedIds);

            if (activeTab === 'saved_mandates') {
                setMandates(savedResponse.data);
            } else {
                // Fetch all mandates for other tabs (filtering can be added later)
                const response = await api.get('/mandates');
                setMandates(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch mandates:", error);
            setMandates([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = async (mandateId) => {
        try {
            if (savedMandateIds.has(mandateId)) {
                await api.delete(`/mandates/${mandateId}/save`);
                const newSaved = new Set(savedMandateIds);
                newSaved.delete(mandateId);
                setSavedMandateIds(newSaved);

                // If on saved tab, remove from list
                if (activeTab === 'saved_mandates') {
                    setMandates(prev => prev.filter(m => m.id !== mandateId));
                }
            } else {
                await api.post(`/mandates/${mandateId}/save`);
                const newSaved = new Set(savedMandateIds);
                newSaved.add(mandateId);
                setSavedMandateIds(newSaved);
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
                        <h1 className="text-3xl font-bold text-slate-900">Find Mandates</h1>
                        <p className="text-slate-500 mt-2">Connect with investors looking for projects like yours.</p>
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
                                onClick={() => setActiveTab('saved_mandates')}
                                className={`${activeTab === 'saved_mandates' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                            >
                                <Bookmark className="w-4 h-4 mr-2" />
                                Saved Mandates ({savedMandateIds.size})
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
                            {mandates.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-slate-500">No mandates found.</p>
                                </div>
                            ) : (
                                mandates.map(mandate => (
                                    <MandateCard
                                        key={mandate.id}
                                        mandate={{
                                            ...mandate,
                                            industryPreference: mandate.targetIndustry, // Map backend field to frontend prop
                                            minInvestment: mandate.minTicketSize,
                                            maxInvestment: mandate.maxTicketSize,
                                            stagePreference: mandate.stagePreference
                                        }}
                                        isSaved={savedMandateIds.has(mandate.id)}
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
                                <h3 className="font-bold text-slate-900">Innovator Profile</h3>
                                <p className="text-sm text-slate-500">Complete your profile</p>
                            </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                            <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">60% completed</p>
                        <button className="w-full border border-emerald-600 text-emerald-600 rounded py-2 text-sm font-medium hover:bg-emerald-50">
                            Edit Profile
                        </button>
                    </div>

                    {/* Promote */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-2">Get Funded Faster</h3>
                        <p className="text-sm text-slate-500 mb-4">Highlight your deal to top investors.</p>
                        <button className="text-emerald-600 text-sm font-medium hover:underline">
                            Learn more
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InnovatorDashboard;
