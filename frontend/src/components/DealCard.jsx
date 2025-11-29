import { Heart, MapPin, DollarSign } from 'lucide-react';

const DealCard = ({ deal, isSaved, onToggleSave }) => {
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-slate-900">{deal.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{deal.industry}</p>
                </div>
                <button
                    onClick={() => onToggleSave(deal.id)}
                    className={`p-2 rounded-full hover:bg-slate-100 ${isSaved ? 'text-red-500 fill-current' : 'text-slate-400'}`}
                >
                    <Heart className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
                </button>
            </div>

            <p className="text-slate-600 text-sm mt-3 line-clamp-3">
                {deal.teaserSummary}
            </p>

            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>${deal.targetAmount?.toLocaleString()}</span>
                </div>
                {deal.location && (
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{deal.location}</span>
                    </div>
                )}
                <div className="flex items-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${deal.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {deal.status}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DealCard;
