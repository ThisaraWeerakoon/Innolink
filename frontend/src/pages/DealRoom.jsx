import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, FileText, CheckCircle, Clock } from 'lucide-react';
import ChatBox from '../components/ChatBox';

const DealRoom = () => {
    const { id } = useParams();
    const { user, api } = useAuth();
    const [deal, setDeal] = useState(null);
    const [accessStatus, setAccessStatus] = useState(null); // 'APPROVED', 'PENDING', 'NONE'
    const [accessRequest, setAccessRequest] = useState(null);
    const [privateData, setPrivateData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDealData = async () => {
            try {
                // 1. Fetch Public Details
                const publicRes = await api.get('/public/deals');
                const publicDeal = publicRes.data.find(d => d.id === id);
                setDeal(publicDeal);

                if (user && publicDeal) {
                    // 2. Check Access Status
                    const accessRes = await api.get(`/access/status/${id}?userId=${user.id}`);
                    const request = accessRes.data;
                    setAccessRequest(request);

                    if (request) {
                        setAccessStatus(request.status);

                        if (request.status === 'APPROVED' && request.ndaSigned) {
                            // 3. Fetch Private Data only if approved AND signed
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
            const res = await api.post(`/deals/${id}/request?userId=${user.id}`);
            setAccessRequest(res.data);
            setAccessStatus('PENDING');
        } catch (error) {
            console.error("Request failed", error);
            alert("Failed to request access");
        }
    };

    const handleSignNda = async () => {
        if (!accessRequest) return;
        try {
            const res = await api.post(`/investor/requests/${accessRequest.id}/sign-nda?userId=${user.id}`);
            setAccessRequest(res.data);
            // After signing, fetch private data
            const privateRes = await api.get(`/deals/${id}/full_details?userId=${user.id}`);
            setPrivateData(privateRes.data);
            alert("NDA Signed. Access Granted.");
        } catch (error) {
            console.error("Failed to sign NDA", error);
            alert("Failed to sign NDA");
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

                {/* NDA Section */}
                {accessStatus === 'APPROVED' && accessRequest && !accessRequest.ndaSigned && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-amber-200">
                        <div className="flex items-center mb-4 text-amber-800">
                            <Shield className="w-6 h-6 mr-2" />
                            <h2 className="text-xl font-bold">Non-Disclosure Agreement Required</h2>
                        </div>
                        <div className="bg-amber-50 p-4 rounded border border-amber-100 text-sm text-amber-900 mb-6 h-48 overflow-y-auto">
                            <p className="font-bold mb-2">CONFIDENTIALITY AGREEMENT</p>
                            <p className="mb-2">By clicking "Sign & Accept" below, you agree to the following terms regarding the confidential information provided by {deal.innovator?.email || 'the Innovator'}:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>You will maintain the confidentiality of all information disclosed.</li>
                                <li>You will not disclose this information to any third party without prior written consent.</li>
                                <li>You will use this information solely for the purpose of evaluating a potential investment.</li>
                                <li>You acknowledge that unauthorized disclosure may cause irreparable harm to the Innovator.</li>
                            </ul>
                        </div>
                        <button
                            onClick={handleSignNda}
                            className="bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700 font-medium w-full sm:w-auto transition-colors"
                        >
                            Sign & Accept NDA
                        </button>
                    </div>
                )}

                {/* Private Content */}
                {accessStatus === 'APPROVED' && accessRequest && accessRequest.ndaSigned && privateData && (
                    <div className="mt-8 relative border-2 border-emerald-500/20 rounded-xl p-8 bg-white overflow-hidden shadow-sm">
                        {/* Watermark */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none overflow-hidden">
                            <span className="text-8xl font-bold text-slate-900 transform -rotate-12 whitespace-nowrap">
                                CONFIDENTIAL • DO NOT DISTRIBUTE
                            </span>
                        </div>

                        <div className="relative z-10 space-y-8">
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
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const response = await api.get(`/documents/${doc.id}/download?userId=${user.id}`, {
                                                                responseType: 'blob',
                                                            });
                                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.setAttribute('download', `${doc.name || 'document'}.pdf`);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            link.remove();
                                                        } catch (error) {
                                                            console.error("Download failed", error);
                                                            alert("Failed to download document");
                                                        }
                                                    }}
                                                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm px-3 py-1 rounded hover:bg-emerald-50 transition-colors flex items-center cursor-pointer"
                                                >
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    Download Watermarked
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 italic">No documents available.</p>
                                )}
                            </div>

                            {/* Chat Section */}
                            <div className="mt-8 border-t border-slate-200 pt-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Direct Communication</h3>

                                {!accessRequest.introRequested ? (
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6 text-center">
                                        <h4 className="text-emerald-900 font-medium mb-2">Interested in this deal?</h4>
                                        <p className="text-emerald-700 mb-4 text-sm">Express your interest to unlock direct chat with the innovator.</p>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await api.post(`/investor/requests/${accessRequest.id}/interest?userId=${user.id}`);
                                                    // Refresh state
                                                    const statusRes = await api.get(`/access/status/${id}?userId=${user.id}`);
                                                    setAccessRequest(statusRes.data);
                                                } catch (err) {
                                                    console.error("Failed to request intro", err);
                                                    alert("Failed to request intro");
                                                }
                                            }}
                                            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                                        >
                                            I'm Interested
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <button
                                            onClick={() => window.location.href = `/messages/deal/${id}`}
                                            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
                                        >
                                            Chat with Innovator
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    </div>
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
