import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, FileText, CheckCircle, Clock } from 'lucide-react';

const DealRoom = () => {
    const { id } = useParams();
    const { user, api } = useAuth();
    const [deal, setDeal] = useState(null);
    const [accessStatus, setAccessStatus] = useState(null); // 'APPROVED', 'PENDING', 'NONE'
    const [privateData, setPrivateData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDealData = async () => {
            try {
                // 1. Fetch Public Details
                // Ideally: const publicRes = await api.get(`/public/deals/${id}`);
                // But we only have list, so we filter:
                const publicRes = await api.get('/public/deals');
                const publicDeal = publicRes.data.find(d => d.id === id);
                setDeal(publicDeal);

                if (user && publicDeal) {
                    // 2. Check Access Status
                    const accessRes = await api.get(`/access/status/${id}?userId=${user.id}`);
                    const accessRequest = accessRes.data;

                    if (accessRequest) {
                        setAccessStatus(accessRequest.status);

                        if (accessRequest.status === 'APPROVED') {
                            // 3. Fetch Private Data
                            const privateRes = await api.get(`/deals/${id}/full_details?userId=${user.id}`);
                            setPrivateData(privateRes.data);
                        }
                    } else {
                        setAccessStatus('NONE');
                    }
                }
            } catch (error) {
                console.error("Error fetching deal data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDealData();
    }, [id, user, api]);

    const handleRequestAccess = async () => {
        try {
            await api.post(`/deals/${id}/request?userId=${user.id}`);
            setAccessStatus('PENDING');
        } catch (error) {
            console.error("Request failed", error);
            alert("Failed to request access");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading deal details...</div>;
    if (!deal) return <div className="p-8 text-center text-red-500">Deal not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Public Header */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-slate-900">{deal.title}</h1>
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                        {deal.industry}
                    </span>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Funding Goal</p>
                    <p className="text-2xl font-bold text-emerald-600">${deal.fundingGoal?.toLocaleString()}</p>
                </div>

                <div className="prose prose-slate max-w-none">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Executive Summary</h3>
                    <p className="text-slate-600 leading-relaxed">{deal.teaser}</p>
                </div>
            </div>

            {/* Access Control Section */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                        <Shield className="w-6 h-6 mr-2 text-emerald-600" />
                        Private Data Room
                    </h2>

                    {accessStatus === 'NONE' && (
                        <button
                            onClick={handleRequestAccess}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center shadow-sm"
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            Request Access
                        </button>
                    )}

                    {accessStatus === 'PENDING' && (
                        <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium flex items-center border border-amber-200">
                            <Clock className="w-4 h-4 mr-2" />
                            Request Pending
                        </span>
                    )}

                    {accessStatus === 'APPROVED' && (
                        <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-medium flex items-center border border-emerald-200">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Access Granted
                        </span>
                    )}
                </div>

                {/* Private Content */}
                {accessStatus === 'APPROVED' && privateData && (
                    <div className="mt-8 relative border-2 border-emerald-500/20 rounded-xl p-8 bg-white overflow-hidden shadow-sm">
                        {/* Watermark */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none overflow-hidden">
                            <span className="text-8xl font-bold text-slate-900 transform -rotate-12 whitespace-nowrap">
                                CONFIDENTIAL • DO NOT DISTRIBUTE
                            </span>
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Confidential Information</h3>
                                <p className="text-slate-700 whitespace-pre-wrap">{privateData.privateContent}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Documents</h3>
                                {privateData.documents && privateData.documents.length > 0 ? (
                                    <div className="grid gap-3">
                                        {privateData.documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-200 transition-colors group">
                                                <div className="flex items-center">
                                                    <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors mr-3" />
                                                    <span className="font-medium text-slate-700">{doc.name}</span>
                                                </div>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm px-3 py-1 rounded hover:bg-emerald-50 transition-colors"
                                                >
                                                    View Document
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 italic">No documents available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DealRoom;
