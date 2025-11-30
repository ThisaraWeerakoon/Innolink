import { Heart, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DealCard = ({ deal, isSaved, onToggleSave }) => {
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col h-full">
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

            <p className="text-slate-600 text-sm mt-3 line-clamp-3 flex-grow">
                {deal.teaserSummary}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
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
                </div>

                <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-xs ${deal.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {deal.status}
                    </span>

                    <Link
                        to={`/listing/${deal.id}`}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center group"
                    >
                        More Details
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DealCard;
