import { Heart, Target, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const MandateCard = ({ mandate, isSaved, onToggleSave }) => {
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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

            <p className="text-slate-600 text-sm mt-3 line-clamp-3">
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
        </div>
    );
};

export default MandateCard;
