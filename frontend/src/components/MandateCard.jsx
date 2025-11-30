import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Target, DollarSign, Send, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MandateCard = ({ mandate, isSaved, onToggleSave }) => {
    const { user, api } = useAuth();
    const [interestStatus, setInterestStatus] = useState(null);
    const [loadingInterest, setLoadingInterest] = useState(false);

    useEffect(() => {
        if (user && user.role === 'INNOVATOR') {
            checkInterest();
        }
    }, [user, mandate.id]);

    const checkInterest = async () => {
        try {
            const response = await api.get(`/mandates/${mandate.id}/interest`);
            if (response.status === 200 && response.data) {
                setInterestStatus(response.data.status);
            }
        } catch (error) {
            console.error("Failed to check interest", error);
        }
    };

    const handleExpressInterest = async () => {
        setLoadingInterest(true);
        try {
            await api.post(`/mandates/${mandate.id}/interest`);
            setInterestStatus('PENDING');
        } catch (error) {
            console.error("Failed to express interest", error);
            alert("Failed to express interest. Please try again.");
        } finally {
            setLoadingInterest(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONTACTED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'CONTACTED': return 'Contacted';
            case 'REJECTED': return 'Rejected';
            default: return 'Interest Sent';
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-slate-900">{mandate.title || "Investment Mandate"}</h3>
                    <p className="text-sm text-slate-500 mt-1">{mandate.industryPreference}</p>
                    {mandate.investorId && (
                        <Link to={`/investor/${mandate.investorId}`} className="text-xs text-emerald-600 hover:underline mt-1 block">
                            Posted by: {mandate.investorName}
                        </Link>
                    )}
                </div>
                <button
                    onClick={() => onToggleSave(mandate.id)}
                    className={`p-2 rounded-full hover:bg-slate-100 ${isSaved ? 'text-red-500 fill-current' : 'text-slate-400'}`}
                >
                    <Heart className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
                </button>
            </div>

            <p className="text-slate-600 text-sm mt-3 line-clamp-3 flex-grow">
                {mandate.description}
            </p>

            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>${mandate.minInvestment?.toLocaleString()} - ${mandate.maxInvestment?.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    <span>{mandate.stagePreference}</span>
                </div>
            </div>

            {user && user.role === 'INNOVATOR' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    {interestStatus ? (
                        <div className={`w-full flex items-center justify-center py-2 px-4 rounded text-sm font-medium border ${getStatusColor(interestStatus)}`}>
                            <Check className="w-4 h-4 mr-2" />
                            {getStatusText(interestStatus)}
                        </div>
                    ) : (
                        <button
                            onClick={handleExpressInterest}
                            disabled={loadingInterest}
                            className="w-full flex items-center justify-center py-2 px-4 rounded text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                            {loadingInterest ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Express Interest
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MandateCard;
