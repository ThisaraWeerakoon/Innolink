import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Marketplace = () => {
    const { api } = useAuth();
    const [deals, setDeals] = useState([]);

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const res = await api.get('/public/deals');
                setDeals(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchDeals();
    }, []);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Investment Opportunities</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map(deal => (
                    <div key={deal.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6 flex flex-col">
                        <div className="mb-4">
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                {deal.industry}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{deal.title}</h3>
                        <p className="text-slate-600 mb-4 flex-1 line-clamp-3">{deal.teaser}</p>
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Goal</p>
                                <p className="font-bold text-emerald-600">${deal.fundingGoal?.toLocaleString()}</p>
                            </div>
                            <Link to={`/listing/${deal.id}`} className="text-slate-900 font-medium hover:text-emerald-600">
                                View Details →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
